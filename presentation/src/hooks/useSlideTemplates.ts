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
  'table-of-contents': [
    {
      type: 'table_of_contents',
      data: {
        items: [
          'Item1: What & Why of Microservices',
          'Item2: Monolith vs Microservices',
          'Item3: Service Design Principles',
          'Item4: Communication & Data',
          'Item5: Deployment & Scaling',
          'Item6: Observability & Resilience',
          'Item7: Security & Governance',
          'Item8: Case Study & Q&A',
        ],
      },
    },
  ],
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
      backgroundColor: {
        type: 'linear',
        colors: [
          { color: '#e3f2fd', pos: 0 }, // soft bluish tint
          { color: '#f5f7fa', pos: 50 }, // very light gray
          { color: '#ffffff', pos: 100 }, // pure white at top
        ],
        rotate: 0,
      },
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
      labelFontColor: '#0A2540',
      labelFontName: 'Oswald',
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
