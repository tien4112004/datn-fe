import type { Slide, SlideTheme } from '@/types/slides';
import type { TableOfContentsLayoutSchema } from './types';
import type { TemplateConfig } from '../types';
import { convertLayoutGeneric } from './index';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getTableOfContentsLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  return {
    containers: {
      title: {
        type: 'text' as const,
        bounds: {
          left: 15,
          top: 15,
          width: SLIDE_WIDTH - 30,
          height: 100,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: theme.titleFontColor,
          fontFamily: theme.titleFontName,
          fontWeight: 'bold',
          fontStyle: 'normal',
        },
      },
      content: {
        type: 'block' as const,
        // Using relative positioning - positioned below title
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 20,
          size: 'fill',
          margin: { left: 60, right: 60, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'space-between',
          gap: 25,
          horizontalAlignment: 'left',
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 4,
            lineCount: 2,
            distribution: 'balanced',
            lineSpacing: 20,
            alternating: false,
          },
          structure: {
            type: 'text' as const,
            label: 'item',
            layout: {
              horizontalAlignment: 'left',
              verticalAlignment: 'top',
            },
            text: {
              color: theme.fontColor,
              fontFamily: theme.fontName,
              fontWeight: 'normal',
              fontStyle: 'normal',
            },
          },
        },
      },
    },
    theme,
  };
};

export const convertTableOfContentsLayout = async (
  data: TableOfContentsLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
    template,
    (d) => ({
      texts: { title: 'Contents' },
      blocks: { content: { item: d.data.items.map((item, index) => `${index + 1}. ${item}`) } },
    }),
    slideId
  );
};
