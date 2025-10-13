import { useSlidesStore } from '@/store';
import type { SlideTheme } from '@/types/slides';
import { convertToSlide } from '@/utils/slideLayout';

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
      const slide = await convertToSlide(data, viewport, theme, undefined, '1');
      slidesStore.appendNewSlide(slide);
    }
  };

  const getTemplateTypes = () => Object.keys(slideTemplates);

  const getThemes = () => THEMES_DATA;

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

const slideTemplates: Record<string, any[]> = {
  'title-with-subtitle': Array(4).fill({
    type: 'title',
    data: {
      title: 'Presentation with really long title',
      subtitle:
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
  }),
  'title-no-subtitle': Array(4).fill({
    type: 'title',
    data: {
      title: 'Presentation with really long title',
    },
  }),
  'two-column-with-image': Array(7).fill({
    type: 'two_column_with_image',
    title: 'Presentation',
    data: {
      items: [
        'Item1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
        'Item2: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        'Item3: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
      ],
      image: 'https://placehold.co/600x400',
    },
  }),
  'two-column': Array(9).fill({
    type: 'two_column',
    title: 'this is a title',
    data: {
      items1: [
        'Item1-1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item1-2: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item1-3: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      ],
      items2: [
        'Item2-1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item2-2: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item2-3: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      ],
    },
  }),
  'main-image': Array(8).fill({
    type: 'main_image',
    data: {
      image: 'https://placehold.co/600x400',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
  }),
  'table-of-contents': Array(6).fill({
    type: 'table_of_contents',
    data: {
      items: [
        'What & Why of Microservices',
        'Monolith vs Microservices',
        'Service Design Principles',
        'Communication & Data',
        'Deployment & Scaling',
        'Observability & Resilience',
        'Security & Governance',
        'Case Study & Q&A',
      ],
    },
  }),
  list: Array(6).fill({
    type: 'list',
    title: 'This is a title',
    data: {
      items: [
        'Item1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item2: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item3: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item4: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item5: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item6: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item7: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      ],
    },
  }),
  'labeled-list': Array(4).fill({
    type: 'labeled_list',
    title: 'Five Fundamentals of Microservices',
    data: {
      items: [
        {
          label: 'Boundaries',
          content: 'Define services around business capabilities and domains.',
        },
        {
          label: 'APIs',
          content: 'Use clear contracts (REST/gRPC) and versioning.',
        },
        {
          label: 'Data',
          content: 'Own your data; avoid shared databases.',
        },
        {
          label: 'Delivery',
          content: 'Automate CI/CD per service for rapid iteration.',
        },
        {
          label: 'Observability',
          content: 'Centralize logs, metrics, and traces for each service.',
        },
      ],
    },
  }),
};

/**
 * Theme data definitions - All presentation themes as data objects
 */
const THEMES_DATA: Record<string, SlideTheme> = {
  default: {
    name: 'Default',
    backgroundColor: '#ffffff',
    themeColors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'],
    fontColor: '#333333',
    fontName: 'Roboto',
    outline: {
      style: 'solid',
      width: 1,
      color: '#cccccc',
    },
    shadow: {
      h: 2,
      v: 2,
      blur: 4,
      color: 'rgba(0, 0, 0, 0.1)',
    },
    titleFontColor: '#0A2540',
    titleFontName: 'Roboto',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 8,
      borderWidth: 1,
      fill: 'semi',
      shadow: {
        h: 0,
        v: 2,
        blur: 8,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      backgroundColor: 'transparent',
      textColor: '#333333',
    },
  },

  business: {
    backgroundColor: '#f8fafc',
    themeColors: ['#1e40af', '#0f172a', '#475569', '#64748b', '#94a3b8'],
    fontColor: '#1e293b',
    fontName: 'Inter',
    outline: {
      style: 'solid',
      width: 1,
      color: '#e2e8f0',
    },
    shadow: {
      h: 0,
      v: 4,
      blur: 6,
      color: 'rgba(0, 0, 0, 0.07)',
    },
    titleFontColor: '#1e40af',
    titleFontName: 'Inter',
    labelFontColor: '#64748b',
    labelFontName: 'Inter',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 6,
      borderWidth: 1,
      fill: 'semi',
      shadow: {
        h: 0,
        v: 2,
        blur: 4,
        color: 'rgba(30, 64, 175, 0.1)',
      },
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
    },
  },

  education: {
    backgroundColor: {
      type: 'linear',
      colors: [
        { color: '#d2f5e9ff', pos: 0 },
        { color: '#f0fdf4', pos: 100 },
      ],
      rotate: 45,
    },
    themeColors: ['#059669', '#0891b2', '#7c3aed', '#dc2626', '#ea580c'],
    fontColor: '#374151',
    fontName: 'Open Sans',
    outline: {
      style: 'solid',
      width: 2,
      color: '#d1fae5',
    },
    shadow: {
      h: 2,
      v: 2,
      blur: 8,
      color: 'rgba(5, 150, 105, 0.15)',
    },
    titleFontColor: '#059669',
    titleFontName: 'Quicksand',
    labelFontColor: '#0891b2',
    labelFontName: 'Nunito',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 12,
      borderWidth: 2,
      fill: 'semi',
      shadow: {
        h: 0,
        v: 3,
        blur: 10,
        color: 'rgba(5, 150, 105, 0.2)',
      },
      backgroundColor: '#f0fdf4',
      textColor: '#065f46',
    },
  },

  creative: {
    backgroundColor: {
      type: 'linear',
      colors: [
        { color: '#d7d0ffff', pos: 0 },
        { color: '#f7f4f7ff', pos: 100 },
      ],
      rotate: 45,
    },
    themeColors: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
    fontColor: '#581c87',
    fontName: 'Poppins',
    outline: {
      style: 'solid',
      width: 2,
      color: '#e9d5ff',
    },
    shadow: {
      h: 3,
      v: 3,
      blur: 12,
      color: 'rgba(139, 92, 246, 0.25)',
    },
    titleFontColor: '#7c3aed',
    titleFontName: 'Comfortaa',
    labelFontColor: '#ec4899',
    labelFontName: 'Fredoka',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 16,
      borderWidth: 2,
      fill: 'semi',
      shadow: {
        h: 0,
        v: 4,
        blur: 16,
        color: 'rgba(139, 92, 246, 0.2)',
      },
      backgroundColor: '#faf5ff',
      textColor: '#6b21a8',
    },
  },

  minimal: {
    backgroundColor: '#ffffff',
    themeColors: ['#000000', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6'],
    fontColor: '#111827',
    fontName: 'Work Sans',
    outline: {
      style: 'solid',
      width: 1,
      color: '#e5e7eb',
    },
    shadow: {
      h: 0,
      v: 1,
      blur: 2,
      color: 'rgba(0, 0, 0, 0.05)',
    },
    titleFontColor: '#000000',
    titleFontName: 'Space Grotesk',
    labelFontColor: '#6b7280',
    labelFontName: 'DM Sans',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 4,
      borderWidth: 1,
      fill: 'none',
      shadow: {
        h: 0,
        v: 1,
        blur: 3,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      backgroundColor: '#fafafa',
      textColor: '#111827',
    },
  },

  modern: {
    backgroundColor: '#0f172a',
    themeColors: ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'],
    fontColor: '#e2e8f0',
    fontName: 'Montserrat',
    outline: {
      style: 'solid',
      width: 1,
      color: '#334155',
    },
    shadow: {
      h: 0,
      v: 4,
      blur: 8,
      color: 'rgba(6, 182, 212, 0.2)',
    },
    titleFontColor: '#06b6d4',
    titleFontName: 'Montserrat',
    labelFontColor: '#06b6d4',
    labelFontName: 'Oswald',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 8,
      borderWidth: 1,
      fill: 'semi',
      shadow: {
        h: 0,
        v: 4,
        blur: 12,
        color: 'rgba(6, 182, 212, 0.3)',
      },
      backgroundColor: '#74a8fa',
      textColor: '#3d4b5e',
    },
  },

  classic: {
    backgroundColor: '#fefcf0',
    themeColors: ['#92400e', '#7c2d12', '#a16207', '#166534', '#1e40af'],
    fontColor: '#451a03',
    fontName: 'Merriweather',
    outline: {
      style: 'solid',
      width: 2,
      color: '#fde68a',
    },
    shadow: {
      h: 2,
      v: 4,
      blur: 6,
      color: 'rgba(146, 64, 14, 0.15)',
    },
    titleFontColor: '#92400e',
    titleFontName: 'Playfair Display',
    labelFontColor: '#a16207',
    labelFontName: 'Lora',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 6,
      borderWidth: 2,
      fill: 'semi',
      shadow: {
        h: 1,
        v: 3,
        blur: 6,
        color: 'rgba(146, 64, 14, 0.2)',
      },
      backgroundColor: '#fffbeb',
      textColor: '#78350f',
    },
  },

  'ocean-professional': {
    backgroundColor: '#0A1929',
    themeColors: ['#D4AF37', '#1565C0', '#0277BD', '#B8860B', '#4A90E2'],
    fontColor: '#E8EAF6',
    fontName: 'Inter',
    outline: {
      style: 'solid',
      width: 1,
      color: '#1E3A5F',
    },
    shadow: {
      h: 0,
      v: 4,
      blur: 8,
      color: 'rgba(212, 175, 55, 0.2)',
    },
    titleFontColor: '#D4AF37',
    titleFontName: 'Playfair Display',
    labelFontColor: '#4A90E2',
    labelFontName: 'Inter',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 8,
      borderWidth: 1,
      fill: 'semi',
      shadow: {
        h: 0,
        v: 3,
        blur: 10,
        color: 'rgba(212, 175, 55, 0.25)',
      },
      backgroundColor: '#1A2A3A',
      textColor: '#E8EAF6',
    },
  },

  'dark-emerald': {
    backgroundColor: '#0F1419',
    themeColors: ['#10B981', '#8B5CF6', '#6366F1', '#34D399', '#A78BFA'],
    fontColor: '#F3F4F6',
    fontName: 'Inter',
    outline: {
      style: 'solid',
      width: 1,
      color: '#1F2937',
    },
    shadow: {
      h: 0,
      v: 4,
      blur: 12,
      color: 'rgba(16, 185, 129, 0.3)',
    },
    titleFontColor: '#10B981',
    titleFontName: 'Montserrat',
    labelFontColor: '#A78BFA',
    labelFontName: 'Inter',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 10,
      borderWidth: 1,
      fill: 'semi',
      shadow: {
        h: 0,
        v: 4,
        blur: 16,
        color: 'rgba(139, 92, 246, 0.25)',
      },
      backgroundColor: '#1F2937',
      textColor: '#F3F4F6',
    },
  },

  'sunset-energy': {
    backgroundColor: '#FFF9F5',
    themeColors: ['#FF5722', '#FF6B35', '#F4A261', '#343752', '#FFB74D'],
    fontColor: '#2D3748',
    fontName: 'Poppins',
    outline: {
      style: 'solid',
      width: 2,
      color: '#FFE0D6',
    },
    shadow: {
      h: 2,
      v: 3,
      blur: 8,
      color: 'rgba(255, 87, 34, 0.2)',
    },
    titleFontColor: '#D84315',
    titleFontName: 'Raleway',
    labelFontColor: '#FF6B35',
    labelFontName: 'Poppins',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 12,
      borderWidth: 2,
      fill: 'semi',
      shadow: {
        h: 0,
        v: 3,
        blur: 12,
        color: 'rgba(255, 87, 34, 0.18)',
      },
      backgroundColor: '#FFF3E0',
      textColor: '#2D3748',
    },
  },

  'tech-cyan': {
    backgroundColor: '#F7FAFC',
    themeColors: ['#00BCD4', '#0288D1', '#FF6F00', '#7C4DFF', '#00ACC1'],
    fontColor: '#1A202C',
    fontName: 'Roboto',
    outline: {
      style: 'solid',
      width: 1,
      color: '#B2EBF2',
    },
    shadow: {
      h: 0,
      v: 2,
      blur: 6,
      color: 'rgba(0, 188, 212, 0.15)',
    },
    titleFontColor: '#00838F',
    titleFontName: 'Space Grotesk',
    labelFontColor: '#0288D1',
    labelFontName: 'Roboto',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 8,
      borderWidth: 1,
      fill: 'semi',
      shadow: {
        h: 0,
        v: 2,
        blur: 8,
        color: 'rgba(0, 188, 212, 0.2)',
      },
      backgroundColor: '#E0F7FA',
      textColor: '#1A202C',
    },
  },

  'sage-wellness': {
    backgroundColor: {
      type: 'linear',
      colors: [
        { color: '#F0F9F4', pos: 0 },
        { color: '#E8F5E9', pos: 100 },
      ],
      rotate: 135,
    },
    themeColors: ['#4CAF50', '#81C784', '#66BB6A', '#7E57C2', '#FFA726'],
    fontColor: '#1B5E20',
    fontName: 'Open Sans',
    outline: {
      style: 'solid',
      width: 2,
      color: '#C8E6C9',
    },
    shadow: {
      h: 1,
      v: 2,
      blur: 6,
      color: 'rgba(76, 175, 80, 0.2)',
    },
    titleFontColor: '#2E7D32',
    titleFontName: 'Nunito',
    labelFontColor: '#388E3C',
    labelFontName: 'Open Sans',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 12,
      borderWidth: 2,
      fill: 'semi',
      shadow: {
        h: 0,
        v: 3,
        blur: 10,
        color: 'rgba(76, 175, 80, 0.15)',
      },
      backgroundColor: '#F1F8E9',
      textColor: '#1B5E20',
    },
  },

  'vintage-retro': {
    backgroundColor: '#FAF3E0',
    themeColors: ['#C15937', '#951233', '#997929', '#5D1D2E', '#B08968'],
    fontColor: '#3E2723',
    fontName: 'Lora',
    outline: {
      style: 'solid',
      width: 2,
      color: '#D7CCC8',
    },
    shadow: {
      h: 2,
      v: 3,
      blur: 6,
      color: 'rgba(93, 29, 46, 0.2)',
    },
    titleFontColor: '#6D4C41',
    titleFontName: 'Playfair Display',
    labelFontColor: '#8D6E63',
    labelFontName: 'Merriweather',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 6,
      borderWidth: 2,
      fill: 'semi',
      shadow: {
        h: 1,
        v: 2,
        blur: 8,
        color: 'rgba(193, 89, 55, 0.2)',
      },
      backgroundColor: '#FFF8E1',
      textColor: '#4E342E',
    },
  },

  'bold-contrast': {
    backgroundColor: '#FFFFFF',
    themeColors: ['#E53E3E', '#2C5282', '#F6AD55', '#38B2AC', '#9F7AEA'],
    fontColor: '#1A202C',
    fontName: 'Work Sans',
    outline: {
      style: 'solid',
      width: 2,
      color: '#E2E8F0',
    },
    shadow: {
      h: 0,
      v: 2,
      blur: 4,
      color: 'rgba(0, 0, 0, 0.1)',
    },
    titleFontColor: '#C53030',
    titleFontName: 'Montserrat',
    labelFontColor: '#2C5282',
    labelFontName: 'Work Sans',
    accentImageShape: 'default',
    card: {
      enabled: true,
      borderRadius: 8,
      borderWidth: 2,
      fill: 'none',
      shadow: {
        h: 0,
        v: 2,
        blur: 8,
        color: 'rgba(229, 62, 62, 0.15)',
      },
      backgroundColor: '#FFF5F5',
      textColor: '#1A202C',
    },
  },
};
