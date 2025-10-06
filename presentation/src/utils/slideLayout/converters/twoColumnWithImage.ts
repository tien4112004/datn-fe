import type { Slide, SlideTheme } from '@/types/slides';
import type { TwoColumnWithImageLayoutSchema } from './types';
import type { TemplateConfig } from '../types';
import { convertLayoutGeneric } from './index';

export const getTwoColumnWithImageLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
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
          height: 120,
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
      image: {
        type: 'image',
        bounds: {
          width: 400,
          height: 300,
          left: {
            expr: '15 + ((SLIDE_WIDTH - 30) / 2 - 400) / 2',
          },
          top: {
            expr: 'after',
            relativeTo: 'title',
            offset: 20,
          },
        },
        border: {
          width: 1,
          color: 'transparent',
          radius: 50,
        },
      },
      content: {
        type: 'block',
        bounds: {
          left: {
            expr: '15 + (SLIDE_WIDTH - 30) / 2',
          },
          top: {
            expr: 'image.top',
          },
          width: {
            expr: '(SLIDE_WIDTH - 30) / 2',
          },
          height: {
            expr: 'SLIDE_HEIGHT - image.top - 40',
          },
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
          structure: {
            type: 'text',
            label: 'item',
            layout: {
              horizontalAlignment: 'center',
              verticalAlignment: 'top',
            },
            border: {
              width: 1,
              color: theme.themeColors[0],
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

export const getTwoColumnBigImageLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  return {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: {
            expr: '15 + image.width + 30',
          },
          top: 15,
          width: {
            expr: '(SLIDE_WIDTH - 2 * 15 - 30) * 0.67',
          },
          height: 120,
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
      image: {
        type: 'image',
        bounds: {
          left: 0,
          top: 0,
          width: {
            expr: '(SLIDE_WIDTH - 2 * 15 - 30) * 0.33',
          },
          height: {
            expr: 'SLIDE_HEIGHT',
          },
        },
        border: {
          width: 1,
          color: 'transparent',
          radius: 0,
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 20,
          size: 'fill',
          margin: { left: 30, right: 30, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'equal',
          gap: 20,
          horizontalAlignment: 'left',
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            layout: {
              horizontalAlignment: 'left',
              verticalAlignment: 'top',
            },
            border: {
              width: 1,
              color: theme.themeColors[0],
            },
            children: [
              {
                label: 'item',
                type: 'text',
                text: {
                  color: theme.fontColor,
                  fontFamily: theme.fontName,
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  lineHeight: 1.4,
                },
              },
            ],
          },
        },
      },
    },
    theme,
  };
};

export const convertTwoColumnWithImageLayout = async (
  data: TwoColumnWithImageLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
    template,
    (d) => ({
      texts: { title: d.title },
      blocks: { content: { item: d.data.items } },
      images: { image: d.data.image },
    }),
    slideId
  );
};
