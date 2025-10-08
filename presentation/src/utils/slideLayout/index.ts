import { selectTemplate } from './converters/templateSelector';
import type { Slide, SlideTheme } from '@/types/slides';
import type {
  SlideViewport,
  SlideLayoutSchema,
  TwoColumnWithImageLayoutSchema,
  MainImageLayoutSchema,
  TitleLayoutSchema,
  TransitionLayoutSchema,
  TwoColumnLayoutSchema,
  VerticalListLayoutSchema,
  HorizontalListLayoutSchema,
  TableOfContentsLayoutSchema,
} from './types';
import { SLIDE_LAYOUT_TYPE } from './types';
import { convertLayoutGeneric, resolveTemplate } from './converters';

/**
 * Converts layout schema to slide based on layout type
 *
 * @param data - The slide layout schema to convert
 * @param viewport - The viewport configuration
 * @param theme - The slide theme
 * @param slideId - Optional slide ID
 * @param seed - Optional seed for deterministic template selection (useful for testing)
 * @returns Promise resolving to a Slide object
 * @throws Error if layout type is not supported
 */
export const convertToSlide = async (
  data: SlideLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme,
  slideId?: string,
  seed?: string
): Promise<Slide> => {
  const layoutType = data.type;

  if (layoutType === SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_IMAGE) {
    const selectedTemplate = selectTemplate(layoutType, seed);
    const template = resolveTemplate(selectedTemplate.config, theme, viewport);
    return convertLayoutGeneric(
      data as TwoColumnWithImageLayoutSchema,
      template,
      (d) => ({
        texts: { title: d.title },
        blocks: { content: { item: d.data.items } },
        images: { image: d.data.image },
      }),
      slideId
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.MAIN_IMAGE) {
    const selectedTemplate = selectTemplate(layoutType, seed);
    const template = resolveTemplate(selectedTemplate.config, theme, viewport);
    return convertLayoutGeneric(
      data as MainImageLayoutSchema,
      template,
      (d) => ({
        texts: { content: d.data.content },
        blocks: { content: { content: [d.data.content] } },
        images: { image: d.data.image },
      }),
      slideId
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.TITLE) {
    const selectedTemplate = selectTemplate(layoutType, seed);
    const template = resolveTemplate(selectedTemplate.config, theme, viewport);
    return convertLayoutGeneric(
      data as TitleLayoutSchema,
      template,
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
      slideId
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.TWO_COLUMN) {
    const selectedTemplate = selectTemplate(layoutType, seed);
    const template = resolveTemplate(selectedTemplate.config, theme, viewport);
    return convertLayoutGeneric(
      data as TwoColumnLayoutSchema,
      template,
      (d) => ({
        texts: { title: d.title },
        blocks: { content: { item: [...d.data.items1, ...d.data.items2] } },
      }),
      slideId
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.VERTICAL_LIST) {
    const selectedTemplate = selectTemplate(layoutType, seed);
    const template = resolveTemplate(selectedTemplate.config, theme, viewport);

    // Check if the template has numbering enabled (label/content structure)
    const contentContainer = template.containers.content;
    const hasNumbering =
      contentContainer?.type === 'block' &&
      contentContainer.childTemplate?.structure?.children?.some(
        (child: any) => child.label === 'label' && child.numbering === true
      );

    return convertLayoutGeneric(
      data as VerticalListLayoutSchema,
      template,
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
      slideId
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.HORIZONTAL_LIST) {
    const selectedTemplate = selectTemplate(layoutType, seed);
    const template = resolveTemplate(selectedTemplate.config, theme, viewport);

    // Check if the template has numbering enabled
    const contentContainer = template.containers.content;
    const hasNumbering =
      contentContainer?.type === 'block' &&
      contentContainer.childTemplate?.structure?.children?.some(
        (child: any) => child.label === 'label' && child.numbering === true
      );

    return convertLayoutGeneric(
      data as HorizontalListLayoutSchema,
      template,
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
      slideId
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.TRANSITION) {
    const selectedTemplate = selectTemplate(layoutType, seed);
    const template = resolveTemplate(selectedTemplate.config, theme, viewport);

    return convertLayoutGeneric(
      data as TransitionLayoutSchema,
      template,
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
      slideId
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.TABLE_OF_CONTENTS) {
    const selectedTemplate = selectTemplate(layoutType, seed);
    const template = resolveTemplate(selectedTemplate.config, theme, viewport);
    return convertLayoutGeneric(
      data as TableOfContentsLayoutSchema,
      template,
      (d) => ({
        texts: { title: 'Contents' },
        blocks: {
          content: { item: d.data.items.map((item: string, index: number) => `${index + 1}. ${item}`) },
        },
      }),
      slideId
    );
  } else {
    throw new Error(`Unsupported layout type: ${layoutType}`);
  }
};
