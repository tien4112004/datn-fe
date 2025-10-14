// Helper utilities
import type {
  PartialTemplateConfig,
  SlideViewport,
  TemplateConfig,
  TextLayoutBlockInstance,
  TextStyleConfig,
} from '../types';
import type { Slide, SlideTheme } from '@/types/slides';
import { resolveTemplateContainers, processBackground } from '../primitives';
import {
  buildLayoutWithUnifiedFontSizing,
  buildCards,
  buildTitle,
  buildText,
  buildImageElement,
  buildCombinedList,
} from '../primitives/layoutProbuild';
import { cloneDeepWith, template } from 'lodash';
import {
  calculateElementBounds,
  collectDescendantTextsByLabel,
  extractLabelStyles,
} from '../primitives/layoutUtils';
import type { GraphicElement } from '../graphics/types';
import { renderGraphics } from '../graphics/renderer';
import type { Bounds } from '../types';
import type { PPTElement } from '@/types/slides';

/**
 * Normalized data structure for all layout types.
 * All layout schemas are mapped to this format before processing.
 */
export interface MappedLayoutData {
  /** Simple text containers (e.g., title, subtitle) - container ID -> text content */
  texts?: Record<string, string>;

  /** Block containers with labeled children - container ID -> label -> array of content */
  blocks?: Record<string, Record<string, string[]>>;

  /** Image containers - container ID -> image source */
  images?: Record<string, string>;
}

/**
 * Data mapper function type - converts layout schema to MappedLayoutData
 */
export type DataMapper<T = any> = (data: T) => MappedLayoutData;

/**
 * Generic layout converter - core conversion pipeline used by all layout types.
 * Eliminates duplicate code by using a data mapper pattern.
 *
 * Pipeline:
 * 1. Map input data to normalized format (texts/blocks/images)
 * 2. Resolve all container bounds (expressions and relative positioning)
 * 3. Process blocks with unified font sizing
 * 4. Process text containers (titles, subtitles)
 * 5. Process image containers with cropping
 * 6. Render decorative graphics
 * 7. Combine elements and sort by zIndex
 * 8. Return final Slide object
 *
 * @param data - Original layout schema data (type-specific)
 * @param template - Resolved template with theme and viewport
 * @param mapData - Function that maps schema data to MappedLayoutData format
 * @param slideId - Optional slide ID (generates UUID if not provided)
 * @returns Promise<Slide> - Complete slide with all elements positioned
 */
export async function convertLayoutGeneric<T = any>(
  data: T,
  template: TemplateConfig,
  mapData: DataMapper<T>,
  slideId?: string
): Promise<Slide> {
  const mappedData = mapData(data);

  // Resolve all container bounds (expressions + relative positioning)
  const resolvedContainers = resolveTemplateContainers(template.containers, {
    width: template.viewport.width,
    height: template.viewport.height,
  });

  const allElements: Array<{ element: any; zIndex: number }> = [];
  const allCards: Array<{ element: any; zIndex: number }> = [];

  // Track actual bounds of rendered elements (for graphics rendering)
  const containerActualBounds: Record<string, Bounds> = {};

  // Track child bounds for each container (for timeline graphics)
  const childBounds: Record<string, Bounds[]> = {};

  // Process block containers with labeled children
  if (mappedData.blocks) {
    for (const [containerId, labelData] of Object.entries(mappedData.blocks)) {
      const container = resolvedContainers[containerId];
      if (!container) {
        continue;
      }

      const zIndex = container.zIndex ?? 0;

      // Check if this is a text container with combined enabled
      if (container.type === 'text' && container.combined?.enabled) {
        const { elements, cards } = processCombinedTextContainer(container, labelData, zIndex);
        allElements.push(...elements);
        allCards.push(...cards);
        continue; // Skip normal block processing
      }

      // Build layout with unified font sizing
      const { instance, elements } = buildLayoutWithUnifiedFontSizing(container, container.bounds, labelData);

      // Extract child bounds for timeline graphics
      if (instance.children && instance.children.length > 0) {
        childBounds[containerId] = instance.children.map((child) => child.bounds);
      }

      // Extract cards (border decorations)
      const cards = buildCards(instance);
      allCards.push(...cards.map((element) => ({ element, zIndex })));

      // Add all PPT elements from each label
      for (const [label, _] of Object.entries(labelData)) {
        const pptElements = elements[label] || [];
        allElements.push(...pptElements.map((element) => ({ element, zIndex })));
      }
    }
  }

  // Process simple text containers (like titles)
  if (mappedData.texts) {
    for (const [containerId, textContent] of Object.entries(mappedData.texts)) {
      const container = resolvedContainers[containerId];
      if (!container || container.type !== 'text') {
        continue;
      }

      // Skip optional containers with missing data
      if (container.optional && !textContent) {
        continue;
      }

      const instance = container as TextLayoutBlockInstance;
      const zIndex = container.zIndex ?? 0;

      // Use buildTitle for title containers (with decorative line), buildText for others
      const textElements =
        containerId === 'title'
          ? buildTitle(textContent, instance, template.theme)
          : buildText(textContent, instance);

      allElements.push(...textElements.map((element) => ({ element, zIndex })));

      // Track actual bounds for title container (used by graphics)
      if (containerId === 'title') {
        const actualBounds = calculateElementBounds(textElements);
        if (actualBounds) {
          containerActualBounds.title = actualBounds;
        }
      }
    }
  }

  // Process image containers
  const imageElements: Array<{ element: any; zIndex: number }> = [];
  if (mappedData.images) {
    for (const [containerId, imageSrc] of Object.entries(mappedData.images)) {
      const container = resolvedContainers[containerId];
      if (!container || container.type !== 'image') {
        continue;
      }

      const zIndex = container.zIndex ?? 0;
      const imageElement = await buildImageElement(imageSrc, container);
      imageElements.push({ element: imageElement, zIndex });
    }
  }

  // Render decorative graphics if provided
  const graphicElements: Array<{ element: any; zIndex: number }> = [];
  if (template.graphics && template.graphics.length > 0) {
    // Extract just the bounds from each container for graphics context
    const containerBounds: Record<string, any> = {};
    for (const [id, container] of Object.entries(resolvedContainers)) {
      containerBounds[id] = container.bounds;
    }

    const graphicsContext = {
      theme: template.theme,
      viewport: template.viewport,
      containerBounds,
      containerActualBounds, // Pass actual rendered bounds
      childBounds, // Pass child bounds for timeline graphics
    };
    const renderedGraphics = renderGraphics(template.graphics, graphicsContext);
    // Graphics render at zIndex 50 by default (above cards but below content)
    graphicElements.push(...renderedGraphics.map((element) => ({ element, zIndex: -1 })));
  }

  // Combine all elements and sort by zIndex (lower values render first/behind)
  const combinedElements = [...allCards, ...allElements, ...imageElements, ...graphicElements];
  combinedElements.sort((a, b) => a.zIndex - b.zIndex);

  const slide: Slide = {
    id: slideId ?? crypto.randomUUID(),
    elements: combinedElements.map((item) => item.element),
    background: processBackground(template.theme),
  };

  return slide;
}

/**
 * Resolves template placeholders with theme values.
 * Replaces {{theme.xxx}} syntax with actual theme values.
 *
 * Uses lodash template engine with custom interpolation syntax.
 *
 * @example
 * // Template: { color: "{{theme.themeColors[0]}}" }
 * // Result: { color: "#FF5733" }
 *
 * @param partialTemplate - Template with {{theme.xxx}} placeholders
 * @param theme - Theme object with colors, fonts, etc.
 * @param viewport - Viewport dimensions
 * @param graphics - Optional decorative graphics
 * @returns Fully resolved template config
 */
export function resolveTemplate(
  partialTemplate: PartialTemplateConfig,
  theme: SlideTheme,
  viewport: SlideViewport,
  graphics?: GraphicElement[]
): TemplateConfig {
  // Use lodash cloneDeepWith to traverse and transform the object tree
  const resolvedContainers = cloneDeepWith(partialTemplate.containers, (value) => {
    // Only process string values that contain template syntax
    if (typeof value === 'string' && value.includes('{{')) {
      try {
        const compiled = template(value, { interpolate: /\{\{(.+?)\}\}/g });
        return compiled({ theme });
      } catch (e) {
        // If template compilation fails, return original string
        return value;
      }
    }
    // Return undefined to let cloneDeepWith handle other types normally
    return undefined;
  });

  const resolvedGraphics = graphics?.map((graphic) => {
    return cloneDeepWith(graphic, (value) => {
      if (typeof value === 'string' && value.includes('{{')) {
        try {
          const compiled = template(value, { interpolate: /\{\{(.+?)\}\}/g });
          return compiled({ theme });
        } catch (e) {
          // If template compilation fails, return original string
          return value;
        }
      }
      // Return undefined to let cloneDeepWith handle other types normally
      return undefined;
    });
  });

  return {
    containers: resolvedContainers,
    theme,
    viewport,
    graphics: resolvedGraphics,
  };
}

/**
 * Processes a text container with combined mode enabled.
 * Extracts label-specific styles from children config and applies them to pattern placeholders.
 *
 * @param container - Text container with combined config
 * @param labelData - Data mapping labels to arrays of values
 * @param zIndex - Z-index for rendering order
 * @returns Object containing PPT elements and card decorations
 */
function processCombinedTextContainer(
  container: any,
  labelData: Record<string, string[]>,
  zIndex: number
): {
  elements: Array<{ element: any; zIndex: number }>;
  cards: Array<{ element: any; zIndex: number }>;
} {
  const pattern = container.combined.pattern;

  // Extract styles for each label from children config
  const labelStyles = extractLabelStyles(container);

  // Collect all descendant texts by label
  const textsByLabel = collectDescendantTextsByLabel(labelData);

  // Apply pattern and styles to each item
  const listContents = textsByLabel.map((item) => {
    return applyPatternWithStyles(pattern, item, labelStyles);
  });

  // Build combined list with unified font sizing
  const textElements = buildCombinedList(listContents, container);
  const elements = textElements.map((element) => ({ element, zIndex }));

  // Extract border/shadow if present
  const cards: Array<{ element: any; zIndex: number }> = [];
  if (container.border || container.shadow) {
    const instance = {
      ...container,
      bounds: container.bounds,
    } as TextLayoutBlockInstance;
    const cardElements = buildCards(instance);
    cards.push(...cardElements.map((element) => ({ element, zIndex })));
  }

  return { elements, cards };
}

/**
 * Applies pattern with label-specific styles to data item.
 * Replaces placeholders like {label}, {content} with styled span elements.
 *
 * @param pattern - HTML pattern with placeholders (e.g., "<strong>{label}:</strong> {content}")
 * @param item - Data item with values for each label
 * @param labelStyles - Map of label names to their styles
 * @returns Formatted HTML string with styled content
 *
 * @example
 * applyPatternWithStyles(
 *   '<strong>{label}:</strong> {content}',
 *   { label: 'Q1', content: 'Revenue' },
 *   Map { label: { fontWeight: 'bold' }, content: { fontWeight: 'normal' } }
 * )
 * // Returns: '<strong><span style="font-weight: bold">Q1</span>:</strong> <span style="font-weight: normal">Revenue</span>'
 */
function applyPatternWithStyles(
  pattern: string,
  item: Record<string, string>,
  labelStyles: Map<string, TextStyleConfig>
): string {
  let formatted = pattern;

  // Replace all placeholders in the pattern with styled values
  for (const [key, value] of Object.entries(item)) {
    const placeholder = `{${key}}`;

    // Get styles for this label from children config
    const styles = labelStyles.get(key);

    // Wrap value with span containing label-specific styles
    let styledValue = value;
    if (styles) {
      const styleAttrs: string[] = [];
      if (styles.fontFamily) styleAttrs.push(`font-family: ${styles.fontFamily}`);
      if (styles.color) styleAttrs.push(`color: ${styles.color}`);
      if (styles.fontWeight) styleAttrs.push(`font-weight: ${styles.fontWeight}`);
      if (styles.fontStyle) styleAttrs.push(`font-style: ${styles.fontStyle}`);

      if (styleAttrs.length > 0) {
        styledValue = `<span style="${styleAttrs.join('; ')}">${value}</span>`;
      }
    }

    formatted = formatted.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), styledValue || '');
  }

  return formatted;
}
