// Helper utilities
import type {
  PartialTemplateConfig,
  SlideViewport,
  TemplateConfig,
  TemplateParameter,
  TextLayoutBlockInstance,
  TemplateContainerConfig,
} from '../types';
import type { GraphicElement } from '../types/graphics';
import type { Slide, SlideTheme, TurningMode } from '@/types/slides';
import { SLIDE_LAYOUT_TYPE } from '@aiprimary/core/templates';
import { resolveTemplateContainers, processBackground, processCombinedTextContainer } from '../primitives';
import {
  buildLayoutWithUnifiedFontSizing,
  buildCards,
  buildTitle,
  buildText,
  buildImageElement,
} from '../primitives/layoutProbuild';
import { cloneDeepWith, template } from 'lodash';
import { calculateElementBounds } from '../primitives/layoutUtils';
import { renderGraphics } from '../primitives/graphicRenderer';
import type { Bounds } from '../types';

/**
 * Resolved template configuration with theme and viewport
 * This is the intermediate form after theme resolution but before bounds resolution
 */
export interface ResolvedTemplateConfig {
  containers: Record<string, TemplateContainerConfig>;
  theme: SlideTheme;
  viewport: SlideViewport;
  graphics?: GraphicElement[];
  parameters?: TemplateParameter[];
}

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
 * Get appropriate slide transition mode based on layout type
 */
function getTurningModeForLayout(layoutType?: string): TurningMode {
  if (!layoutType) return 'fade'; // Default

  const transitionMap: Record<string, TurningMode> = {
    [SLIDE_LAYOUT_TYPE.TITLE]: 'fade',
    [SLIDE_LAYOUT_TYPE.LIST]: 'slideX',
    [SLIDE_LAYOUT_TYPE.LABELED_LIST]: 'slideY',
    [SLIDE_LAYOUT_TYPE.TWO_COLUMN]: 'slideX',
    [SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_IMAGE]: 'fade',
    [SLIDE_LAYOUT_TYPE.MAIN_IMAGE]: 'scale',
    [SLIDE_LAYOUT_TYPE.TABLE_OF_CONTENTS]: 'slideY',
    [SLIDE_LAYOUT_TYPE.TIMELINE]: 'slideX',
    [SLIDE_LAYOUT_TYPE.PYRAMID]: 'scaleY',
  };

  return transitionMap[layoutType] || 'fade';
}

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
 * @param layoutMetadata - Optional layout metadata for template switching
 * @param parameterOverrides - Optional custom parameter values to override template defaults
 * @returns Promise<Slide> - Complete slide with all elements positioned
 */
export async function convertLayoutGeneric<T = any>(
  data: T,
  template: ResolvedTemplateConfig,
  mapData: DataMapper<T>,
  slideId?: string,
  layoutMetadata?: { layoutSchema: any; templateId: string; layoutType: string },
  parameterOverrides?: Record<string, number | boolean>
): Promise<Slide> {
  const mappedData = mapData(data);

  // Resolve all container bounds (expressions + relative positioning + parameters)
  const resolvedContainers = resolveTemplateContainers(
    template.containers,
    {
      width: template.viewport.width,
      height: template.viewport.height,
    },
    template.parameters,
    parameterOverrides
  );

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
      const { instance, elements } = buildLayoutWithUnifiedFontSizing(
        container,
        container.bounds,
        labelData,
        template.viewport,
        template.parameters,
        parameterOverrides
      );

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
    // Graphics render at zIndex -1 by default (behind all content)
    graphicElements.push(...renderedGraphics.map((element) => ({ element, zIndex: -1 })));
  }

  // Combine all elements and sort by zIndex (lower values render first/behind)
  const combinedElements = [...allCards, ...allElements, ...imageElements, ...graphicElements];
  combinedElements.sort((a, b) => a.zIndex - b.zIndex);

  const slide: Slide = {
    id: slideId ?? crypto.randomUUID(),
    elements: combinedElements.map((item) => item.element),
    background: processBackground(template.theme),
    turningMode: getTurningModeForLayout(layoutMetadata?.layoutType),
    ...(layoutMetadata && {
      layout: {
        schema: layoutMetadata.layoutSchema,
        templateId: layoutMetadata.templateId,
        layoutType: layoutMetadata.layoutType,
        // New AI slides start in preview mode (locked for editing until template confirmed)
        isTemplatePreview: true,
        // Store parameter overrides if provided
        parameterOverrides: parameterOverrides,
      },
    }),
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
 * @param parameters - Optional template parameters for customization
 * @returns Fully resolved template config
 */
export function resolveTemplate(
  partialTemplate: PartialTemplateConfig,
  theme: SlideTheme,
  viewport: SlideViewport,
  graphics?: GraphicElement[],
  parameters?: TemplateParameter[]
): ResolvedTemplateConfig {
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
    parameters,
  };
}
