import {
  twoColumnWithImageLayoutTemplate,
  twoColumnBigImageLayoutTemplate,
  verticalListLayoutTemplate,
  twoColumnLayoutTemplate,
  mainImageLayoutTemplate,
  titleLayoutTemplate,
  transitionLayoutTemplate,
  tableOfContentsLayoutTemplate,
  horizontalListLayoutTemplate,
} from './converters/template';
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
 * @returns Promise resolving to a Slide object
 * @throws Error if layout type is not supported
 */
export const convertToSlide = async (
  data: SlideLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme,
  slideId?: string
): Promise<Slide> => {
  const layoutType = data.type;

  if (layoutType === SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_IMAGE) {
    const template = resolveTemplate(twoColumnWithImageLayoutTemplate, theme, viewport);
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
  } else if (layoutType === SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_BIG_IMAGE) {
    const template = resolveTemplate(twoColumnBigImageLayoutTemplate, theme, viewport);
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
    const template = resolveTemplate(mainImageLayoutTemplate, theme, viewport);
    return convertLayoutGeneric(
      data as MainImageLayoutSchema,
      template,
      (d) => ({
        blocks: { content: { content: [d.data.content] } },
        images: { image: d.data.image },
      }),
      slideId
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.TITLE) {
    const template = resolveTemplate(titleLayoutTemplate, theme, viewport);
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
    const template = resolveTemplate(twoColumnLayoutTemplate, theme, viewport);
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
    const template = resolveTemplate(verticalListLayoutTemplate, theme, viewport);
    return convertLayoutGeneric(
      data as VerticalListLayoutSchema,
      template,
      (d) => ({
        texts: { title: d.title },
        blocks: { content: { item: d.data.items } },
      }),
      slideId
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.HORIZONTAL_LIST) {
    const template = resolveTemplate(horizontalListLayoutTemplate, theme, viewport);
    return convertLayoutGeneric(
      data as HorizontalListLayoutSchema,
      template,
      (d) => ({
        texts: { title: d.title },
        blocks: {
          content: {
            label: d.data.items.map((item: { label: string; content: string }) => item.label),
            content: d.data.items.map((item: { label: string; content: string }) => item.content),
          },
        },
      }),
      slideId
    );
  } else if (layoutType === SLIDE_LAYOUT_TYPE.TRANSITION) {
    const template = resolveTemplate(transitionLayoutTemplate, theme, viewport);
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
    const template = resolveTemplate(tableOfContentsLayoutTemplate, theme, viewport);
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
