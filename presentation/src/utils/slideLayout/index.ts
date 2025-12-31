/**
 * Slide Layout Engine
 *
 * A declarative layout system for generating presentation slides from data.
 *
 * ## Architecture
 *
 * The engine uses a two-phase approach:
 * 1. **Config Phase**: Define layout templates (structure without positioning)
 * 2. **Instance Phase**: Resolve templates with data into positioned elements
 *
 * ## Key Concepts
 *
 * ### Config vs Instance
 * - **Config**: Template definition (LayoutBlockConfig) - describes structure without bounds
 * - **Instance**: Resolved layout (LayoutBlockInstance) - all bounds calculated and assigned
 *
 * ### Template System
 * - Templates define container structure with {{theme.xxx}} placeholders
 * - Supports static children (predefined) and dynamic children (data-driven via childTemplate)
 * - Multiple templates per layout type, selected deterministically or randomly
 *
 * ### Layout Algorithms
 * - **Positioning**: Axis-agnostic layout supporting horizontal/vertical orientations
 * - **Distribution**: equal, space-between, space-around, or ratio-based (e.g., '30/70')
 * - **Wrapping**: Multi-line/column layouts with balanced, top-heavy, or bottom-heavy distribution
 *
 * ### Font Sizing
 * - **Unified Sizing**: Elements with same label share font size for visual consistency
 * - **Optimization**: Binary-search-like algorithm finds largest size that fits
 * - **Label Groups**: 'label', 'content', 'item' - each group sized independently
 *
 * ## Usage
 *
 * ```typescript
 * const slide = await convertToSlide(
 *   { type: 'VERTICAL_LIST', title: 'Features', data: { items: ['Fast', 'Easy'] }},
 *   { width: 1000, height: 562.5 },
 *   theme
 * );
 * ```
 */

import type { PPTImageElement, Slide, SlideTheme } from '@/types/slides';
import type { Template } from '@aiprimary/core/templates';
import type {
  SlideViewport,
  SlideLayoutSchema,
  TwoColumnWithImageLayoutSchema,
  MainImageLayoutSchema,
  TitleLayoutSchema,
  TwoColumnLayoutSchema,
  ListLayoutSchema,
  LabeledListLayoutSchema,
  TableOfContentsLayoutSchema,
  TimelineLayoutSchema,
  PyramidLayoutSchema,
} from './types';
import { SLIDE_LAYOUT_TYPE } from './types';
import { convertLayoutGeneric, resolveTemplate } from './converters';
import { getImageSize } from '../image';

/**
 * Main entry point: Converts layout schema to a complete slide.
 *
 * This is the primary public API for the slide layout engine.
 *
 * Process:
 * 1. Resolve template with theme and viewport (replace {{theme.xxx}} placeholders)
 * 2. Map input data to template containers (texts, blocks, images)
 * 3. Convert to final Slide object with all PPT elements
 *
 * Supported layout types:
 * - TWO_COLUMN_WITH_IMAGE: Two-column content with side image
 * - MAIN_IMAGE: Full-screen image with caption
 * - TITLE: Title slide with optional subtitle
 * - TWO_COLUMN: Two-column text layout
 * - VERTICAL_LIST: Vertical bullet list
 * - HORIZONTAL_LIST: Horizontal multi-column list
 * - TRANSITION: Section transition slide
 * - TABLE_OF_CONTENTS: Auto-numbered contents page
 *
 * Template Selection: Template must be selected by the caller using helper functions:
 * - selectRandomTemplate(layoutType, seed?) - Random selection with optional seed
 * - selectTemplateById(layoutType, templateId) - Select specific template by ID
 * - selectFirstTemplate(layoutType) - Get first available template
 * - selectNextTemplate(layoutType) - Cycle through templates
 *
 * @param data - Layout schema with type and content data
 * @param viewport - Slide dimensions (typically 1000x562.5 for 16:9)
 * @param theme - Visual theme (colors, fonts, backgrounds)
 * @param template - Template to use for rendering the slide
 * @param slideId - Optional custom slide ID
 * @param parameterOverrides - Optional custom parameter values to override template defaults
 * @returns Promise resolving to a complete Slide object
 * @throws Error if layout type is not supported
 *
 * @example
 * const template = selectRandomTemplate('list');
 * const slide = await convertToSlide(
 *   { type: 'VERTICAL_LIST', title: 'Features', data: { items: ['Fast', 'Easy', 'Powerful'] }},
 *   { width: 1000, height: 562.5 },
 *   theme,
 *   template
 * );
 */
export const convertToSlide = async (
  data: SlideLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme,
  template: Template,
  slideId?: string,
  parameterOverrides?: Record<string, number | boolean>
): Promise<Slide> => {
  const layoutType = data.type;

  if (layoutType === SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_IMAGE) {
    const resolvedTemplate = resolveTemplate(
      template.config,
      theme,
      viewport,
      template.graphics,
      template.parameters
    );
    return convertLayoutGeneric(
      data as TwoColumnWithImageLayoutSchema,
      resolvedTemplate,
      (d) => ({
        texts: { title: d.title },
        blocks: { content: { item: d.data.items } },
        images: { image: d.data.image },
      }),
      slideId,
      {
        layoutSchema: data,
        templateId: template.id,
        layoutType: layoutType,
      },
      parameterOverrides
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.MAIN_IMAGE) {
    const resolvedTemplate = resolveTemplate(
      template.config,
      theme,
      viewport,
      template.graphics,
      template.parameters
    );
    return convertLayoutGeneric(
      data as MainImageLayoutSchema,
      resolvedTemplate,
      (d) => ({
        texts: { content: d.data.content },
        blocks: { content: { content: [d.data.content] } },
        images: { image: d.data.image },
      }),
      slideId,
      {
        layoutSchema: data,
        templateId: template.id,
        layoutType: layoutType,
      },
      parameterOverrides
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.TITLE) {
    const resolvedTemplate = resolveTemplate(
      template.config,
      theme,
      viewport,
      template.graphics,
      template.parameters
    );
    return convertLayoutGeneric(
      data as TitleLayoutSchema,
      resolvedTemplate,
      (d) => ({
        texts: {
          title: d.data.title,
        },
        blocks: {
          content: {
            subtitle: d.data.subtitle ? [d.data.subtitle] : [],
          },
        },
      }),
      slideId,
      {
        layoutSchema: data,
        templateId: template.id,
        layoutType: layoutType,
      },
      parameterOverrides
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.TWO_COLUMN) {
    const resolvedTemplate = resolveTemplate(
      template.config,
      theme,
      viewport,
      template.graphics,
      template.parameters
    );

    // Check if template has separate leftColumn/rightColumn containers
    const hasLeftRightColumns =
      resolvedTemplate.containers.leftColumn && resolvedTemplate.containers.rightColumn;

    return convertLayoutGeneric(
      data as TwoColumnLayoutSchema,
      resolvedTemplate,
      (d) => {
        const texts = { title: d.title };
        let blocks: Record<string, Record<string, string[]>>;

        if (hasLeftRightColumns) {
          // Map to separate columns
          blocks = {
            leftColumn: { item: d.data.items1 },
            rightColumn: { item: d.data.items2 },
          };
        } else {
          // Map to single content container (legacy templates)
          blocks = {
            content: { item: [...d.data.items1, ...d.data.items2] },
          };
        }

        return { texts, blocks };
      },
      slideId,
      {
        layoutSchema: data,
        templateId: template.id,
        layoutType: layoutType,
      },
      parameterOverrides
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.LIST) {
    const resolvedTemplate = resolveTemplate(
      template.config,
      theme,
      viewport,
      template.graphics,
      template.parameters
    );

    // Check if the template has numbering enabled (label/content structure)
    const contentContainer = resolvedTemplate.containers.content;
    const hasNumbering =
      contentContainer?.type === 'block' &&
      contentContainer.childTemplate?.structure?.children?.some(
        (child: any) => child.label === 'label' && child.numbering === true
      );

    return convertLayoutGeneric(
      data as ListLayoutSchema,
      resolvedTemplate,
      (d) => {
        // For numbered templates: split into label (numbers) and content (text)
        // For non-numbered templates: single 'item' field
        const contentData: Record<string, string[]> = hasNumbering
          ? {
              label: d.data.items.map((_, index) => String(index + 1).padStart(2, '0')),
              content: d.data.items,
            }
          : {
              item: d.data.items,
            };

        return {
          texts: { title: d.title },
          blocks: { content: contentData },
        };
      },
      slideId,
      {
        layoutSchema: data,
        templateId: template.id,
        layoutType: layoutType,
      },
      parameterOverrides
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.LABELED_LIST) {
    const resolvedTemplate = resolveTemplate(
      template.config,
      theme,
      viewport,
      template.graphics,
      template.parameters
    );

    // Check if the template has numbering enabled
    const contentContainer = resolvedTemplate.containers.content;
    const hasNumbering =
      contentContainer?.type === 'block' &&
      contentContainer.childTemplate?.structure?.children?.some(
        (child: any) => child.label === 'label' && child.numbering === true
      );

    return convertLayoutGeneric(
      data as LabeledListLayoutSchema,
      resolvedTemplate,
      (d) => ({
        texts: { title: d.title },
        blocks: {
          content: {
            label: hasNumbering
              ? d.data.items.map((_, index) => String(index + 1).padStart(2, '0'))
              : d.data.items.map((item: { label: string; content: string }) => item.label),
            content: d.data.items.map((item: { label: string; content: string }) => item.content),
          },
        },
      }),
      slideId,
      {
        layoutSchema: data,
        templateId: template.id,
        layoutType: layoutType,
      },
      parameterOverrides
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.TABLE_OF_CONTENTS) {
    const resolvedTemplate = resolveTemplate(
      template.config,
      theme,
      viewport,
      template.graphics,
      template.parameters
    );

    // Check if the template has numbering enabled
    const contentContainer = resolvedTemplate.containers.content;
    const hasNumbering =
      contentContainer?.type === 'block' &&
      contentContainer.childTemplate?.structure?.children?.some(
        (child: any) => child.label === 'label' && child.numbering === true
      );

    return convertLayoutGeneric(
      data as TableOfContentsLayoutSchema,
      resolvedTemplate,
      (d) => ({
        texts: { title: 'Contents' },
        blocks: {
          content: {
            content: d.data.items,
            label: hasNumbering ? d.data.items.map((_, index) => String(index + 1).padStart(2, '0')) : [],
          },
        },
      }),
      slideId,
      {
        layoutSchema: data,
        templateId: template.id,
        layoutType: layoutType,
      },
      parameterOverrides
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.TIMELINE) {
    const resolvedTemplate = resolveTemplate(
      template.config,
      theme,
      viewport,
      template.graphics,
      template.parameters
    );

    return convertLayoutGeneric(
      data as TimelineLayoutSchema,
      resolvedTemplate,
      (d) => ({
        texts: { title: d.title },
        blocks: {
          content: {
            label: d.data.items.map((item) => item.label),
            content: d.data.items.map((item) => item.content),
          },
        },
      }),
      slideId,
      {
        layoutSchema: data,
        templateId: template.id,
        layoutType: layoutType,
      },
      parameterOverrides
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.PYRAMID) {
    const resolvedTemplate = resolveTemplate(
      template.config,
      theme,
      viewport,
      template.graphics,
      template.parameters
    );

    return convertLayoutGeneric(
      data as PyramidLayoutSchema,
      resolvedTemplate,
      (d) => ({
        texts: { title: d.title },
        blocks: {
          content: {
            item: d.data.items,
          },
        },
      }),
      slideId,
      {
        layoutSchema: data,
        templateId: template.id,
        layoutType: layoutType,
      },
      parameterOverrides
    );
  } else {
    throw new Error(`Unsupported layout type: ${layoutType}`);
  }
};

export const updateImageSource = async (
  element: PPTImageElement,
  newSrc: string
): Promise<PPTImageElement> => {
  const imageOriginalSize = await getImageSize(newSrc);
  const imageRatio = imageOriginalSize.width / imageOriginalSize.height;
  const containerRatio = element.width / element.height;

  let finalClip;
  if (imageRatio > containerRatio) {
    // Image is wider - clip left/right sides
    const clipPercent = ((1 - containerRatio / imageRatio) / 2) * 100;
    finalClip = {
      shape: 'rect',
      range: [
        [clipPercent, 0],
        [100 - clipPercent, 100],
      ],
    };
  } else {
    // Image is taller - clip top/bottom
    const clipPercent = ((1 - imageRatio / containerRatio) / 2) * 100;
    finalClip = {
      shape: 'rect',
      range: [
        [0, clipPercent],
        [100, 100 - clipPercent],
      ],
    };
  }

  return {
    ...element,
    src: newSrc,
    clip: finalClip,
  } as PPTImageElement;
};

// Export template selection helper functions
export {
  selectRandomTemplate,
  selectTemplateById,
  selectFirstTemplate,
  selectNextTemplate,
} from './converters/templateSelectionHelpers';

// Export template registry for advanced usage
export { templateRegistry } from './converters/templateRegistry';

// Re-export existing template utilities (for fallback/mock mode)
export {
  selectTemplate,
  getTemplateVariations,
  getTemplateVariationsAsync,
  TEMPLATE_VARIATIONS,
} from './converters/templateSelector';
