import type { Slide, SlideTheme } from '@/types/slides';
import type { MainImageLayoutSchema } from './types';
import type { TemplateConfig, Bounds } from '../types';
import { convertLayoutGeneric } from './index';
import LayoutPrimitives from '../layoutPrimitives';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getMainImageLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  // Calculate image dimensions
  const imageWidth = SLIDE_WIDTH * 0.6; // 60% of slide width
  const imageHeight = imageWidth * (2 / 3); // 3:2 aspect ratio

  // Ensure image doesn't exceed 50% of slide height
  const maxImageHeight = SLIDE_HEIGHT * 0.5;
  let finalImageWidth = imageWidth;
  let finalImageHeight = imageHeight;

  if (imageHeight > maxImageHeight) {
    finalImageHeight = maxImageHeight;
    finalImageWidth = finalImageHeight * (3 / 2);
  }

  const imagePosition = LayoutPrimitives.layoutItemsInBlock(
    [{ width: finalImageWidth, height: finalImageHeight }],
    {
      layout: {
        horizontalAlignment: 'center',
        verticalAlignment: 'center',
      },
      bounds: { left: 0, top: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT },
    } as any
  )[0];

  // Adjust image position slightly up to make room for content
  const contentMarginTop = 40;
  const adjustedImageTop = imagePosition.top - contentMarginTop / 2;

  const imageBounds: Bounds = {
    left: imagePosition.left,
    top: adjustedImageTop,
    width: finalImageWidth,
    height: finalImageHeight,
  };

  // Calculate content area - below the image
  const contentAreaTop = adjustedImageTop + finalImageHeight + contentMarginTop;
  const contentAvailableHeight = SLIDE_HEIGHT - contentAreaTop - 40; // Bottom margin
  const contentAvailableWidth = SLIDE_WIDTH * 0.8; // 80% of slide width

  const contentBounds: Bounds = {
    left: (SLIDE_WIDTH - contentAvailableWidth) / 2,
    top: contentAreaTop,
    width: contentAvailableWidth,
    height: contentAvailableHeight,
  };

  return {
    containers: {
      image: {
        type: 'image' as const,
        bounds: imageBounds,
      },
      content: {
        type: 'block' as const,
        bounds: contentBounds,
        layout: {
          distribution: 'equal',
          gap: 10,
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text' as const,
            label: 'content',
            layout: {
              horizontalAlignment: 'center',
              verticalAlignment: 'center',
            },
            text: {
              color: theme.fontColor,
              fontFamily: theme.fontName,
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'center',
            },
          },
        },
      },
    },
    theme,
  };
};

export const convertMainImageLayout = async (
  data: MainImageLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  return convertLayoutGeneric(
    data,
    template,
    (d) => ({
      blocks: { content: { content: [d.data.content] } },
      images: { image: d.data.image },
    }),
    slideId
  );
};
