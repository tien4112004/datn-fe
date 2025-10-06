import type { Slide, SlideTheme } from '@/types/slides';
import type { TwoColumnLayoutSchema } from './types';
import type { TemplateConfig } from '../types';
import { convertLayoutGeneric } from './index';

export const getTwoColumnLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  return {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 15,
          top: 15,
          width: {
            expr: 'SLIDE_WIDTH - 30',
          },
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
          textAlign: 'center',
        },
      },
      content: {
        type: 'block',
        // Using relative positioning - positioned below title
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 20,
          size: 'fill',
          margin: { left: 30, right: 30, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'space-between',
          gap: 20,
          horizontalAlignment: 'center',
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
            lineSpacing: 15,
            alternating: true,
          },
          structure: {
            type: 'text',
            label: 'item',
            layout: {
              distribution: 'equal',
              horizontalAlignment: 'left',
              verticalAlignment: 'top',
            },
            text: {
              color: theme.fontColor,
              fontFamily: theme.fontName,
              fontWeight: 'normal',
              fontStyle: 'normal',
              lineHeight: 1.7,
            },
            border: {
              color: theme.themeColors[0],
              width: 1,
              radius: 8,
            },
          },
        },
      },
    },
    theme,
  };
};

export const getHorizontalListLayoutTemplateOneRow = (theme: SlideTheme): TemplateConfig => {
  return {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 15,
          top: 15,
          width: {
            expr: 'SLIDE_WIDTH - 30',
          },
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
        type: 'block',
        bounds: {
          left: 60,
          top: 140,
          width: {
            expr: 'SLIDE_WIDTH - 120',
          },
          height: {
            expr: 'SLIDE_HEIGHT - 155 - 40',
          },
        },
        layout: {
          distribution: 'space-around',
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
          orientation: 'horizontal',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'item',
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

export const convertTwoColumnLayout = async (
  data: TwoColumnLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
    template,
    (d) => ({
      texts: { title: d.title },
      blocks: { content: { item: [...d.data.items1, ...d.data.items2] } },
    }),
    slideId
  );
};
