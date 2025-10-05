import type { Slide, SlideTheme } from '@/types/slides';
import type { MainImageLayoutSchema } from './types';
import type { TextLayoutBlockInstance, TemplateConfig, Bounds } from '../types';
import LayoutPrimitives from '../layoutPrimitives';
import LayoutProBuilder from '../layoutProbuild';

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

  // Calculate image position (centered)
  const imagePosition = LayoutPrimitives.getPosition(
    { left: 0, top: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT },
    { width: finalImageWidth, height: finalImageHeight },
    { horizontalAlignment: 'center', verticalAlignment: 'center' }
  );

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
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
      },
      content: {
        type: 'text' as const,
        bounds: contentBounds,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        layout: {
          distribution: 'equal',
          spacingBetweenItems: 10,
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
    theme,
  };
};

export const convertMainImageLayout = async (
  data: MainImageLayoutSchema,

  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  // Merge template config with bounds to create instances
  const contentInstance = {
    ...template.containers.content,
    bounds: template.containers.content.bounds,
  } as TextLayoutBlockInstance;

  const contentElements = await LayoutPrimitives.createItemElementsWithStyles(
    [data.data.content],
    contentInstance
  );

  // Create image element
  const imageElement = await LayoutProBuilder.buildImageElement(data.data.image, template.containers.image);

  const slide: Slide = {
    id: slideId ?? crypto.randomUUID(),
    elements: [imageElement, ...contentElements],
    background: LayoutPrimitives.processBackground(template.theme),
  };

  return slide;
};
