import { useSlidesStore } from '@/store';
import type { SlideTheme } from '@/types/slides';
import { convertToSlide } from '@/utils/slideLayout';

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
  'two-column-with-image': Array(6).fill({
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
  'two-column': Array(4).fill({
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
  'main-image': Array(4).fill({
    type: 'main_image',
    data: {
      image: 'https://placehold.co/600x400',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
  }),
  'table-of-contents': Array(4).fill({
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
  'vertical-list': Array(6).fill({
    type: 'vertical_list',
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
  'horizontal-list': Array(4).fill({
    type: 'horizontal_list',
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

export default function useSlideTemplates() {
  const slidesStore = useSlidesStore();

  const createSlide = async (slideType: string) => {
    const slideData = slideTemplates[slideType];
    if (!slideData) {
      console.error(`Unknown slide type: ${slideType}`);
      return;
    }

    const theme = {
      id: 'modern',
      name: 'Modern',
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
        backgroundColor: '#74a8faff',
        textColor: '#3d4b5eff',
      },
    } as SlideTheme;

    for (const data of slideData) {
      const slide = await convertToSlide(data, viewport, theme, undefined, '1');
      slidesStore.appendNewSlide(slide);
    }
  };

  const getTemplateTypes = () => Object.keys(slideTemplates);

  return {
    createSlide,
    getTemplateTypes,
  };
}
