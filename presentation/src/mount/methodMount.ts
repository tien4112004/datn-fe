import { getBackgroundStyle } from '@/hooks/useSlideBackgroundStyle';
import { getSlideTemplates, getThemes } from '@/hooks/useSlideTemplates';
import { initializeFonts } from '@/utils/font';
import {
  convertToSlide,
  selectRandomTemplate,
  selectTemplateById,
  selectFirstTemplate,
  selectNextTemplate,
  templateRegistry,
} from '@/utils/slideLayout';

export default {
  getBackgroundStyle,
  convertToSlide,
  selectRandomTemplate,
  selectTemplateById,
  selectFirstTemplate,
  selectNextTemplate,
  templateRegistry,
  initializeFonts,
  getThemes,
  getSlideTemplates,
};
