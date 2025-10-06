import type { HorizontalListLayoutSchema } from './types';
import type { Bounds, TemplateConfig } from '../types';
import type { Slide, SlideTheme } from '@/types/slides';
import { convertLayoutGeneric } from './index';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getHorizontalListLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  const titleBounds: Bounds = {
    left: 0,
    top: 15,
    width: SLIDE_WIDTH,
    height: 120,
  };

  return {
    containers: {
      title: {
        type: 'text',
        bounds: titleBounds,
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
        id: 'content',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 20,
          size: 'fill',
          margin: { left: 30, right: 30, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'space-around',
          gap: 25,
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
          orientation: 'horizontal',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 4,
            lineCount: 'auto',
            distribution: 'balanced',
            lineSpacing: 15,
            alternating: true,
          },
          structure: {
            type: 'block',
            label: 'item',
            layout: {
              distribution: 'equal',
              gap: -20,
              horizontalAlignment: 'center',
              verticalAlignment: 'top',
              orientation: 'vertical',
            },
            border: {
              color: theme.themeColors[0],
              width: 1,
              radius: 8,
            },
            children: [
              {
                type: 'text',
                id: 'label',
                layout: {
                  horizontalAlignment: 'center',
                  verticalAlignment: 'center',
                },
                label: 'label',
                text: {
                  color: theme.fontColor,
                  fontFamily: theme.fontName,
                  fontWeight: 'bold',
                  fontStyle: 'normal',
                  textAlign: 'center',
                },
              },
              {
                type: 'text',
                id: 'content',
                layout: {
                  horizontalAlignment: 'center',
                  verticalAlignment: 'center',
                },
                label: 'content',
                text: {
                  color: theme.fontColor,
                  fontFamily: theme.fontName,
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  textAlign: 'center',
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

export const convertHorizontalListLayout = async (
  data: HorizontalListLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
    template,
    (d) => ({
      texts: { title: d.title },
      blocks: {
        content: {
          label: d.data.items.map((item) => item.label),
          content: d.data.items.map((item) => item.content),
        },
      },
    }),
    slideId
  );
};
