import { getBackgroundStyle } from '@/hooks/useSlideBackgroundStyle';
import { getThemes } from '@/hooks/useSlideTemplates';
import { initializeFonts } from '@/utils/font';
import { convertToSlide } from '@/utils/slideLayout';

export default {
  getBackgroundStyle,
  convertToSlide,
  initializeFonts,
  getThemes,
};
