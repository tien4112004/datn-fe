import type { Slide, SlideTheme } from '@/types/slides';
import type { VerticalListLayoutSchema } from './types';
import type { Bounds, TemplateConfig } from '../types';
import { convertLayoutGeneric } from './index';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getVerticalListLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  const titleBounds: Bounds = {
    left: 0,
    top: 15,
    width: SLIDE_WIDTH,
    height: 120,
  };

  return {
    containers: {
      title: {
        type: 'text' as const,
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
          textAlign: 'center',
        },
      },
      content: {
        type: 'block' as const,
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
          distribution: 'space-between',
          gap: 20,
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 3,
            lineCount: 3,
            distribution: 'balanced',
            lineSpacing: 20,
            alternating: false,
          },
          structure: {
            type: 'text' as const,
            label: 'item',
            layout: {
              horizontalAlignment: 'left',
              verticalAlignment: 'center',
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
              textAlign: 'left',
            },
          },
        },
      },
    },
    theme,
  };
};

export const convertVerticalListLayout = async (
  data: VerticalListLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
    template,
    (d) => ({
      texts: { title: d.title },
      blocks: { content: { item: d.data.items } },
    }),
    slideId
  );
};
