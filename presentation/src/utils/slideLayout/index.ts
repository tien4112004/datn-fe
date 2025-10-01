import { type SlideViewport } from './slideLayout';
import {
  convertTwoColumnWithImage,
  convertTwoColumnWithBigImage,
  convertMainImage,
  convertTitleSlide,
  convertTwoColumn,
  convertVerticalList,
  convertHorizontalList,
  convertTransition,
  convertTableOfContents,
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
} from './converters';
import type { ExtendedSlideTheme } from './theme';

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
  theme: ExtendedSlideTheme,
  slideId?: string
) => {
  if (data.type === SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_IMAGE) {
    return await convertTwoColumnWithImage(data as TwoColumnWithImageLayoutSchema, viewport, theme, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_BIG_IMAGE) {
    return await convertTwoColumnWithBigImage(
      data as TwoColumnWithImageLayoutSchema,
      viewport,
      theme,
      slideId
    );
  }
  if (data.type === SLIDE_LAYOUT_TYPE.MAIN_IMAGE) {
    return await convertMainImage(data as MainImageLayoutSchema, viewport, theme, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TITLE) {
    return await convertTitleSlide(data as TitleLayoutSchema, viewport, theme, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TWO_COLUMN) {
    return await convertTwoColumn(data as TwoColumnLayoutSchema, viewport, theme, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.VERTICAL_LIST) {
    return await convertVerticalList(data as VerticalListLayoutSchema, viewport, theme, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.HORIZONTAL_LIST) {
    return await convertHorizontalList(data as HorizontalListLayoutSchema, viewport, theme, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TRANSITION) {
    return await convertTransition(data as TransitionLayoutSchema, viewport, theme, slideId);
  }
  if (data.type === SLIDE_LAYOUT_TYPE.TABLE_OF_CONTENTS) {
    return await convertTableOfContents(data as TableOfContentsLayoutSchema, viewport, theme, slideId);
  }
  throw new Error('Unsupported layout type');
};
