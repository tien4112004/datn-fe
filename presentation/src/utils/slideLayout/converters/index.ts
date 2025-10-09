// Helper utilities
import type { PartialTemplateConfig, SlideViewport, TemplateConfig, TextLayoutBlockInstance } from '../types';
import type { Slide, SlideTheme } from '@/types/slides';
import { resolveTemplateContainers, processBackground } from '../primitives';
import {
  buildLayoutWithUnifiedFontSizing,
  buildCards,
  buildTitle,
  buildText,
  buildImageElement,
} from '../primitives/layoutProbuild';
import { cloneDeepWith, template } from 'lodash';

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
 * 6. Combine elements and sort by zIndex
 * 7. Return final Slide object
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

  // Process block containers with labeled children
  if (mappedData.blocks) {
    for (const [containerId, labelData] of Object.entries(mappedData.blocks)) {
      const container = resolvedContainers[containerId];
      if (!container || container.type !== 'block') {
        continue;
      }

      const zIndex = container.zIndex ?? 0;

      // Build layout with unified font sizing
      const { instance, elements } = buildLayoutWithUnifiedFontSizing(container, container.bounds, labelData);

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

  // Combine all elements and sort by zIndex (lower values render first/behind)
  const combinedElements = [...allCards, ...allElements, ...imageElements];
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
 * @returns Fully resolved template config
 */
export function resolveTemplate(
  partialTemplate: PartialTemplateConfig,
  theme: SlideTheme,
  viewport: SlideViewport
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

  return {
    containers: resolvedContainers,
    theme,
    viewport,
  };
}
