import type { PPTTextElement, Slide, SlideTheme } from '@/types/slides';
import { SlideLayoutCalculator, type SlideViewport, type ImageBounds } from '../slideLayout';
import { calculateLargestOptimalFontSize, applyFontSizeToElement } from '../fontSizeCalculator';
import { createItemElement } from '../htmlTextCreation';
import { generateUniqueId } from '../utils';
import { createImageElement } from '../graphic';
import type { MainImageLayoutSchema } from './types';

export const convertMainImage = async (
  data: MainImageLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme,
  slideId?: string
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Calculate image dimensions - larger for main image layout
  const imageWidth = layoutCalculator.slideWidth * 0.6; // 60% of slide width
  const imageHeight = imageWidth * (2 / 3); // Maintain 3:2 aspect ratio

  // Ensure image doesn't exceed 50% of slide height
  const maxImageHeight = layoutCalculator.slideHeight * 0.5;
  let finalImageWidth = imageWidth;
  let finalImageHeight = imageHeight;

  if (imageHeight > maxImageHeight) {
    finalImageHeight = maxImageHeight;
    finalImageWidth = finalImageHeight * (3 / 2);
  }

  // Calculate content area - below the image
  const contentMarginTop = 40; // Space between image and content
  const contentAreaTop =
    layoutCalculator.getVerticallyCenterPosition(finalImageHeight) + finalImageHeight + contentMarginTop;
  const contentAvailableHeight = layoutCalculator.slideHeight - contentAreaTop - 40; // Bottom margin
  const contentAvailableWidth = layoutCalculator.slideWidth * 0.8; // 80% of slide width

  // Calculate optimal font size for content using element-based approach
  const contentElement = createItemElement({
    content: data.data.content,
    fontSize: 20, // Initial size, will be optimized
    lineHeight: 1.4,
    fontFamily: theme.fontName,
    color: theme.fontColor,
  });

  const contentFontSize = calculateLargestOptimalFontSize(
    contentElement,
    contentAvailableWidth,
    contentAvailableHeight,
    'content'
  );

  // Apply the calculated font size to the element
  applyFontSizeToElement(contentElement, contentFontSize, 1.4);

  // Format content with calculated font size
  const contentText = `<p style="text-align: center;"><span style="font-size: ${contentFontSize}px;">${data.data.content}</span></p>`;

  // Calculate content dimensions using element-based measurement
  const contentDimensions = layoutCalculator.measureHTMLElement(contentElement, {
    maxWidth: contentAvailableWidth,
    maxHeight: contentAvailableHeight,
  });

  // Calculate positions
  const imagePosition = {
    left: layoutCalculator.getHorizontallyCenterPosition(finalImageWidth),
    top: layoutCalculator.getVerticallyCenterPosition(finalImageHeight) - contentMarginTop / 2,
  };

  const contentPosition = {
    left: layoutCalculator.getHorizontallyCenterPosition(contentDimensions.width),
    top: imagePosition.top + finalImageHeight + contentMarginTop,
  };

  // Create slide elements
  const slide: Slide = {
    id: slideId ?? generateUniqueId(),
    elements: [
      await createImageElement(data.data.image, {
        ...imagePosition,
        width: finalImageWidth,
        height: finalImageHeight,
      } as ImageBounds),
      {
        id: generateUniqueId(),
        type: 'text',
        content: contentText,
        defaultFontName: theme.fontName,
        defaultColor: theme.fontColor,
        left: contentPosition.left,
        top: contentPosition.top,
        width: contentDimensions.width,
        height: contentDimensions.height,
      } as PPTTextElement,
    ],
  };

  return slide;
};
