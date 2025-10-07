// Helper utilities
import type { PartialTemplateConfig, SlideViewport, TemplateConfig, TextLayoutBlockInstance } from '../types';
import type { PPTTextElement, Slide, SlideTheme } from '@/types/slides';
import LayoutPrimitives from '../primitives';
import LayoutProBuilder from '../primitives/layoutProbuild';
import { cloneDeepWith, template } from 'lodash';

/**
 * Mapped layout data structure that normalizes all layout schemas
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
 * Generic layout converter - eliminates duplicate conversion logic across all layouts
 *
 * @param data - Original layout schema data
 * @param template - Template configuration with container definitions
 * @param mapData - Function that maps the schema data to MappedLayoutData format
 * @param slideId - Optional slide ID (generates UUID if not provided)
 * @returns Promise<Slide> - The final slide with all elements positioned
 */
export async function convertLayoutGeneric<T = any>(
  data: T,
  template: TemplateConfig,
  mapData: DataMapper<T>,
  slideId?: string
): Promise<Slide> {
  const mappedData = mapData(data);

  // Resolve all container bounds (expressions + relative positioning)
  const resolvedContainers = LayoutPrimitives.resolveTemplateContainers(template.containers, {
    width: template.viewport.width,
    height: template.viewport.height,
  });

  const allElements: any[] = [];
  const allCards: any[] = [];

  // Process block containers with labeled children
  if (mappedData.blocks) {
    for (const [containerId, labelData] of Object.entries(mappedData.blocks)) {
      const container = resolvedContainers[containerId];
      if (!container || container.type !== 'block') {
        continue;
      }

      // Build layout with unified font sizing
      const { instance, elements } = LayoutProBuilder.buildLayoutWithUnifiedFontSizing(
        container,
        container.bounds,
        labelData
      );

      // Extract cards (border decorations)
      allCards.push(...LayoutProBuilder.buildCards(instance));

      // For each label, extract instances and create PPT elements
      for (const [label, _] of Object.entries(labelData)) {
        const labelInstances = LayoutPrimitives.recursivelyGetAllLabelInstances(
          instance,
          label
        ) as TextLayoutBlockInstance[];

        const labelElements = elements[label] || [];

        // Map to PPT elements
        const pptElements = labelElements.map((el, index) => ({
          id: crypto.randomUUID(),
          type: 'text',
          content: el.outerHTML,
          defaultFontName: labelInstances[index].text?.fontFamily,
          defaultColor: labelInstances[index].text?.color,
          left: labelInstances[index].bounds.left,
          top: labelInstances[index].bounds.top,
          width: labelInstances[index].bounds.width,
          height: labelInstances[index].bounds.height,
          textType: 'content',
          lineHeight: labelInstances[index].text?.lineHeight,
        })) as PPTTextElement[];

        allElements.push(...pptElements);
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

      // Always use buildTitle for text containers
      const textElements = LayoutProBuilder.buildTitle(textContent, instance, template.theme);

      allElements.push(...textElements);
    }
  }

  // Process image containers
  const imageElements: any[] = [];
  if (mappedData.images) {
    for (const [containerId, imageSrc] of Object.entries(mappedData.images)) {
      const container = resolvedContainers[containerId];
      if (!container || container.type !== 'image') {
        continue;
      }

      const imageElement = await LayoutProBuilder.buildImageElement(imageSrc, container);
      imageElements.push(imageElement);
    }
  }

  // Combine all elements in the correct order
  const slide: Slide = {
    id: slideId ?? crypto.randomUUID(),
    elements: [...allCards, ...allElements, ...imageElements],
    background: LayoutPrimitives.processBackground(template.theme),
  };

  return slide;
}

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
