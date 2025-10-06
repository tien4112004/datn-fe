import {
  type SlideLayoutSchema,
  type TwoColumnWithImageLayoutSchema,
  type MainImageLayoutSchema,
  type TitleLayoutSchema,
  type TwoColumnLayoutSchema,
  type VerticalListLayoutSchema,
  type HorizontalListLayoutSchema,
  type TransitionLayoutSchema,
  type TableOfContentsLayoutSchema,
  SLIDE_LAYOUT_TYPE,
  convertLayoutGeneric,
} from './converters';
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
import type { SlideViewport, TemplateConfig } from './types';
import { resolveTemplate } from './templateResolver';

// Export font size calculation utilities
export {
  calculateLargestOptimalFontSize,
  calculateFontSizeForAvailableSpace,
  applyFontSizeToElements,
  applyFontSizeToElement,
  type FontSizeCalculationResult,
} from './fontSizeCalculator';

// Layout Converter Functions
const convertTwoColumnWithImageLayout = async (
  data: TwoColumnWithImageLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
    template,
    (d) => ({
      texts: { title: d.title },
      blocks: { content: { item: d.data.items } },
      images: { image: d.data.image },
    }),
    slideId
  );
};

const convertMainImageLayout = async (
  data: MainImageLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
    template,
    (d) => ({
      blocks: { content: { content: [d.data.content] } },
      images: { image: d.data.image },
    }),
    slideId
  );
};

const convertTitleLayout = async (
  data: TitleLayoutSchema | TransitionLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
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
};

const convertTransitionLayout = async (
  data: TransitionLayoutSchema,
  template: TemplateConfig,
  slideId?: string
) => {
  return await convertTitleLayout(data, template, slideId);
};

const convertTwoColumnLayout = async (
  data: TwoColumnLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
    template,
    (d) => ({
      texts: { title: d.title },
      blocks: { content: { item: [...d.data.items1, ...d.data.items2] } },
    }),
    slideId
  );
};

const convertVerticalListLayout = async (
  data: VerticalListLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
    template,
    (d) => ({
      texts: { title: d.title },
      blocks: { content: { item: d.data.items } },
    }),
    slideId
  );
};

const convertHorizontalListLayout = async (
  data: HorizontalListLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
    template,
    (d) => ({
      texts: { title: d.title },
      blocks: {
        content: {
          label: d.data.items.map((item) => item.label),
          content: d.data.items.map((item) => item.content),
        },
      },
    }),
    slideId
  );
};

const convertTableOfContentsLayout = async (
  data: TableOfContentsLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
    template,
    (d) => ({
      texts: { title: 'Contents' },
      blocks: { content: { item: d.data.items.map((item, index) => `${index + 1}. ${item}`) } },
    }),
    slideId
  );
};

export const convertToSlide = async (
  data: SlideLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme,
  slideId?: string
) => {
  if (data.type === SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_IMAGE) {
    const template = resolveTemplate(twoColumnWithImageLayoutTemplate, theme, viewport);
    return await convertTwoColumnWithImageLayout(data as TwoColumnWithImageLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_BIG_IMAGE) {
    const template = resolveTemplate(twoColumnBigImageLayoutTemplate, theme, viewport);
    return await convertTwoColumnWithImageLayout(data as TwoColumnWithImageLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.MAIN_IMAGE) {
    const template = resolveTemplate(mainImageLayoutTemplate, theme, viewport);
    return await convertMainImageLayout(data as MainImageLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TITLE) {
    const template = resolveTemplate(titleLayoutTemplate, theme, viewport);
    return await convertTitleLayout(data as TitleLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TWO_COLUMN) {
    const template = resolveTemplate(twoColumnLayoutTemplate, theme, viewport);
    return await convertTwoColumnLayout(data as TwoColumnLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.VERTICAL_LIST) {
    const template = resolveTemplate(verticalListLayoutTemplate, theme, viewport);
    return await convertVerticalListLayout(data as VerticalListLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.HORIZONTAL_LIST) {
    const template = resolveTemplate(horizontalListLayoutTemplate, theme, viewport);
    return await convertHorizontalListLayout(data as HorizontalListLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TRANSITION) {
    const template = resolveTemplate(transitionLayoutTemplate, theme, viewport);
    return await convertTransitionLayout(data as TransitionLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TABLE_OF_CONTENTS) {
    const template = resolveTemplate(tableOfContentsLayoutTemplate, theme, viewport);
    return await convertTableOfContentsLayout(data as TableOfContentsLayoutSchema, template, slideId);
  }
  throw new Error('Unsupported layout type');
};
