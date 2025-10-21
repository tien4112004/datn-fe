import { getBackgroundStyle } from '@/hooks/useSlideBackgroundStyle';
import { getSlideTemplates, getThemes } from '@/hooks/useSlideTemplates';
import { initializeFonts } from '@/utils/font';
import { convertToSlide } from '@/utils/slideLayout';

export default {
  getBackgroundStyle,
  convertToSlide,
  initializeFonts,
  getThemes,
  getSlideTemplates,
};
