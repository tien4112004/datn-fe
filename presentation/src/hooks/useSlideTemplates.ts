import { useSlidesStore } from '@/store';
import { convertToSlide, selectNextTemplate } from '@/utils/slideLayout';
import { TEMPLATE_VARIATIONS } from '@/utils/slideLayout/converters/templateSelector';
import { SLIDE_LAYOUT_TYPE } from '@aiprimary/core/templates';
import { generateSampleTemplateData, type LayoutType, THEMES_DATA } from '@aiprimary/frontend-data';

export default function useSlideTemplates() {
  const slidesStore = useSlidesStore();

  const createSlide = async (slideType: string, themeName: string) => {
    const slideData = slideTemplates[slideType];
    if (!slideData) {
      console.error(`Unknown slide type: ${slideType}`);
      return;
    }

    const theme = THEMES_DATA[themeName];
    if (!theme) {
      console.error(`Unknown theme: ${themeName}`);
      return;
    }

    for (const data of slideData) {
      const template = await selectNextTemplate(data.type);
      const slide = await convertToSlide(data, viewport, theme, template, undefined);
      slidesStore.appendNewSlide(slide);
      slidesStore.setTheme(theme);
    }
  };

  const getTemplateTypes = () => Object.keys(slideTemplates);

  return {
    createSlide,
    getTemplateTypes,
    getThemes,
  };
}

const viewport = {
  width: 1000,
  height: 562.5,
};

export const getThemes = () => THEMES_DATA;
export const getSlideTemplates: () => any[] = () => {
  return Object.entries(slideTemplates)
    .filter(([key]) => key !== 'test')
    .map(([_, value]) => value[0])
    .flat();
};

// Generate slide templates dynamically using frontend-data
const generateSlideTemplates = (): Record<string, any[]> => {
  const layoutTypeMapping: Record<string, LayoutType> = {
    title: 'title' as LayoutType,
    list: 'list' as LayoutType,
    labeled_list: 'labeled_list' as LayoutType,
    two_column: 'two_column' as LayoutType,
    two_column_with_image: 'two_column_with_image' as LayoutType,
    main_image: 'main_image' as LayoutType,
    table_of_contents: 'table_of_contents' as LayoutType,
    timeline: 'timeline' as LayoutType,
    pyramid: 'pyramid' as LayoutType,
  };

  const templates: Record<string, any[]> = {};

  // Generate templates for each layout type
  Object.entries(SLIDE_LAYOUT_TYPE).forEach(([key, layoutType]) => {
    const frontendLayoutType = layoutTypeMapping[layoutType as string];
    if (!frontendLayoutType) return;

    const sampleData = generateSampleTemplateData(frontendLayoutType);
    const variations = TEMPLATE_VARIATIONS[layoutType];

    if (variations) {
      // Convert underscore format to hyphenated format for UI compatibility
      // e.g., "two_column" -> "two-column", "labeled_list" -> "labeled-list"
      const hyphenatedKey = (layoutType as string).replace(/_/g, '-');
      templates[hyphenatedKey] = variations.map((tmpl) => ({
        ...sampleData,
        title: tmpl.name,
      }));
    }
  });

  return templates;
};

const slideTemplates = generateSlideTemplates();
