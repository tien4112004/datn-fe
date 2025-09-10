import type { SlideTheme } from '@/types/slides';
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
} from './converters';

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

export const convertToSlide = async (data: any, viewport: SlideViewport, theme: SlideTheme) => {
  if (data.type === 'two_column_with_image') {
    return await convertTwoColumnWithImage(data, viewport, theme);
  }
  if (data.type === 'two_column_with_big_image') {
    return await convertTwoColumnWithBigImage(data, viewport, theme);
  }
  if (data.type === 'main_image') {
    return await convertMainImage(data, viewport, theme);
  }
  if (data.type === 'title') {
    return await convertTitleSlide(data, viewport, theme);
  }
  if (data.type === 'two_column') {
    return await convertTwoColumn(data, viewport, theme);
  }
  if (data.type === 'vertical_list') {
    return await convertVerticalList(data, viewport, theme);
  }
  if (data.type === 'horizontal_list') {
    return await convertHorizontalList(data, viewport, theme);
  }
  if (data.type === 'transition') {
    return await convertTransition(data, viewport, theme);
  }
  if (data.type === 'table_of_contents') {
    return await convertTableOfContents(data, viewport, theme);
  }
  throw new Error('Unsupported layout type');
};
