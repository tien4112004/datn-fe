import { type SlideViewport } from './slideLayout';
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
  getTransitionLayoutTemplate,
} from './converters';
import {
  convertTwoColumnWithImageLayout,
  getTwoColumnBigImageLayoutTemplate,
  getTwoColumnWithImageLayoutTemplate,
} from './converters/twoColumnWithImage';
import { convertVerticalListLayout, getVerticalListLayoutTemplate } from './converters/verticalList';
import { convertTwoColumnLayout, getTwoColumnLayoutTemplate } from './converters/twoColumn';
import { convertMainImageLayout, getMainImageLayoutTemplate } from './converters/mainImage';
import { convertTitleLayout, convertTransitionLayout, getTitleLayoutTemplate } from './converters/title';
import { convertTableOfContentsLayout, getTableOfContentsLayoutTemplate } from './converters/tableOfContents';
import { convertHorizontalListLayout, getHorizontalListLayoutTemplate } from './converters/horizontalList';
import type { SlideTheme } from '@/types/slides';

// Export font size calculation utilities
export {
  calculateLargestOptimalFontSize,
  calculateFontSizeForAvailableSpace,
  applyFontSizeToElements,
  applyFontSizeToElement,
  type FontSizeCalculationResult,
} from './fontSizeCalculator';

// Export layout utilities
export { SlideLayoutCalculator, type SlideViewport } from './slideLayout';

export const convertToSlide = async (
  data: SlideLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme,
  slideId?: string
) => {
  if (data.type === SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_IMAGE) {
    const template = getTwoColumnWithImageLayoutTemplate(theme);
    return await convertTwoColumnWithImageLayout(data as TwoColumnWithImageLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_BIG_IMAGE) {
    const template = getTwoColumnBigImageLayoutTemplate(theme);
    return await convertTwoColumnWithImageLayout(data as TwoColumnWithImageLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.MAIN_IMAGE) {
    const template = getMainImageLayoutTemplate(theme);
    return await convertMainImageLayout(data as MainImageLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TITLE) {
    const template = getTitleLayoutTemplate(theme);
    return await convertTitleLayout(data as TitleLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TWO_COLUMN) {
    const template = getTwoColumnLayoutTemplate(theme);
    return await convertTwoColumnLayout(data as TwoColumnLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.VERTICAL_LIST) {
    const template = getVerticalListLayoutTemplate(theme);
    return await convertVerticalListLayout(data as VerticalListLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.HORIZONTAL_LIST) {
    const template = getHorizontalListLayoutTemplate(theme);
    return await convertHorizontalListLayout(data as HorizontalListLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TRANSITION) {
    const template = getTransitionLayoutTemplate(theme);
    return await convertTransitionLayout(data as TransitionLayoutSchema, template, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TABLE_OF_CONTENTS) {
    const template = getTableOfContentsLayoutTemplate(theme);
    return await convertTableOfContentsLayout(data as TableOfContentsLayoutSchema, template, slideId);
  }
  throw new Error('Unsupported layout type');
};
