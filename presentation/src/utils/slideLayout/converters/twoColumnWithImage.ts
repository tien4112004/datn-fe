import type { Slide, SlideTheme } from '@/types/slides';
import type { TwoColumnWithImageLayoutSchema } from './types';
import type { Bounds, TemplateConfig } from '../types';
import { convertLayoutGeneric } from './index';
import LayoutPrimitives from '../layoutPrimitives';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getTwoColumnWithImageLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  const columns = LayoutPrimitives.getColumnsLayout([50, 50]);
  const imageDimensions = { width: 400, height: 300 };

  const titleBounds: Bounds = {
    left: 15,
    top: 15,
    width: SLIDE_WIDTH - 30,
    height: 120,
  };

  const imagePosition = LayoutPrimitives.layoutItemsInBlock([imageDimensions], {
    layout: {
      horizontalAlignment: 'center',
      verticalAlignment: 'top',
    },
    bounds: {
      left: columns[0].left,
      top: columns[0].top + 140,
      width: columns[0].width,
      height: columns[0].height - 120,
    },
  } as any)[0];

  const imageBounds: Bounds = {
    ...imagePosition,
    ...imageDimensions,
  };

  const contentBounds: Bounds = {
    left: columns[1].left,
    top: columns[1].top + 140,
    width: columns[1].width,
    height: columns[1].height - 180,
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
          textAlign: 'center',
        },
      },
      image: {
        type: 'image',
        bounds: imageBounds,
        border: {
          width: 1,
          color: 'transparent',
          radius: 50,
        },
      },
      content: {
        type: 'block',
        bounds: contentBounds,
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

// ============================================================================

export const getTwoColumnBigImageLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  // Static column layout: 33/67 split
  const GAP = 30;
  const MARGIN = 15;
  const leftColumnWidth = (SLIDE_WIDTH - 2 * MARGIN - GAP) * 0.33;
  const rightColumnWidth = (SLIDE_WIDTH - 2 * MARGIN - GAP) * 0.67;

  const leftColumnLeft = MARGIN;
  const rightColumnLeft = MARGIN + leftColumnWidth + GAP;

  const imageHeight = SLIDE_HEIGHT;
  const imageWidth = leftColumnWidth;

  const imageBounds: Bounds = {
    left: 0,
    top: 0,
    width: imageWidth,
    height: imageHeight,
  };

  const titleBounds: Bounds = {
    left: rightColumnLeft,
    top: 15,
    width: rightColumnWidth,
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
      image: {
        type: 'image',
        bounds: imageBounds,
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
