import type { PPTTextElement, PPTImageElement, Slide, SlideTheme, PPTLineElement } from '@/types/slides';
import { SlideLayoutCalculator, type SlideViewport } from './slideLayout';
import { calculateFontSizeForAvailableSpace, calculateOptimalFontSize } from './fontSizeCalculator';
import { generateUniqueId } from './utils';
import { createTitleLine } from './graphic';

export interface TwoColumnWithImageLayoutSchema {
  type: string;
  title: string;
  data: {
    image: string;
    items: string[];
  };
}

export interface MainImageLayoutSchema {
  type: string;
  data: {
    image: string;
    content: string;
  };
}

function formatTitleContent(content: string, fontSize: number): string {
  return `<p style="text-align: center;"><strong><span style="font-size: ${fontSize}px;">${content}</span></strong></p>`;
}

// function formatItemContent(content: string, fontSize: number): string {
//   return `<p style="text-align: left;"><span style="font-size: ${fontSize}px;">${content}</span></p>`;
// }

function formatItemContentWithLineHeight(content: string, fontSize: number, lineHeight: number): string {
  return `<p style="text-align: left; line-height: ${lineHeight};"><span style="font-size: ${fontSize}px;">${content}</span></p>`;
}

export const convertTwoColumnWithImage = (
  data: TwoColumnWithImageLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio);

  // Calculate available space for content column (column 1, right side)
  const contentColumnBlock = layoutCalculator.getColumnAvailableBlock(1, 2, 100, 40);
  const contentAvailableWidth = contentColumnBlock.width - 40; // Padding
  const contentAvailableHeight = contentColumnBlock.height;

  // Get adaptive styles based on available space
  const adaptiveStyles = calculateFontSizeForAvailableSpace(
    data.data.items,
    contentAvailableWidth,
    contentAvailableHeight,
    viewport
  );

  // Calculate title dimensions and font size based on available width
  const titleAvailableWidth = layoutCalculator.slideWidth * 0.9; // 90% of slide width
  const titleAvailableHeight = 80; // Reasonable title height
  const titleFontSize = calculateOptimalFontSize(
    data.title,
    titleAvailableWidth,
    titleAvailableHeight,
    'title'
  );
  const titleContent = formatTitleContent(data.title, titleFontSize);
  const titleDimensions = layoutCalculator.calculateTitleDimensions(titleContent);
  const imageDimensions = layoutCalculator.calculateImageDimensions();

  // Get image position in first column
  const imagePosition = layoutCalculator.getColumnCenterPosition(
    imageDimensions.height,
    imageDimensions.width,
    0
  );

  // Pre-calculate all item dimensions for variable height layout
  const itemContentsAndDimensions = data.data.items.map((item) => {
    const itemContent = formatItemContentWithLineHeight(
      item,
      adaptiveStyles.fontSize,
      adaptiveStyles.lineHeight
    );
    const itemDimensions = layoutCalculator.calculateTextDimensions(itemContent);
    return { content: itemContent, dimensions: itemDimensions };
  });

  // Calculate positions using variable heights and adaptive spacing
  const itemPositions = layoutCalculator.getItemPositionsWithCustomSpacing(
    itemContentsAndDimensions.map((item) => item.dimensions),
    1, // Column index 1 (right column)
    adaptiveStyles.spacing
  );

  const titlePositions = [layoutCalculator.getHorizontallyCenterPosition(titleDimensions.width), 15];

  // Create slide elements
  const slide: Slide = {
    id: generateUniqueId(),
    elements: [
      {
        id: generateUniqueId(),
        type: 'text',
        content: titleContent,
        defaultFontName: theme.fontName,
        defaultColor: theme.fontColor,
        left: titlePositions[0],
        top: titlePositions[1],
        width: titleDimensions.width,
        height: titleDimensions.height,
      } as PPTTextElement,
      {
        id: generateUniqueId(),
        type: 'image',
        src: data.data.image,
        fixedRatio: false,
        left: imagePosition.left,
        top: imagePosition.top,
        width: imageDimensions.width,
        height: imageDimensions.height,
      } as PPTImageElement,
      // Graphic elements
      createTitleLine(
        {
          width: titleDimensions.width,
          height: titleDimensions.height,
          left: titlePositions[0],
          top: titlePositions[1],
        },
        theme
      ),

      // Item text elements with variable height positioning
      ...itemContentsAndDimensions.map((item, index) => {
        const position = itemPositions[index];

        return {
          id: generateUniqueId(),
          type: 'text',
          // content : itemContent,
          content: item.content,
          defaultFontName: theme.fontName,
          defaultColor: theme.fontColor,
          // left: itemPosition.left,
          // top: itemPosition.top,
          // width: itemDimensions.width,
          // height: itemDimensions.height,
          left: position.left,
          top: position.top,
          width: position.width,
          height: position.height,
        } as PPTTextElement;
      }),
    ],
  };

  return slide;
};

export const convertMainImage = (data: MainImageLayoutSchema, viewport: SlideViewport, theme: SlideTheme) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio);

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

  // Calculate optimal font size for content
  const contentFontSize = calculateOptimalFontSize(
    data.data.content,
    contentAvailableWidth,
    contentAvailableHeight,
    'content'
  );

  // Format content with calculated font size
  const contentText = `<p style="text-align: center;"><span style="font-size: ${contentFontSize}px;">${data.data.content}</span></p>`;

  // Calculate content dimensions
  const contentDimensions = layoutCalculator.calculateTextDimensions(contentText, {
    maxWidthRatio: 0.8,
    maxHeightRatio: 0.3,
    padding: 20,
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
    id: generateUniqueId(),
    elements: [
      {
        id: generateUniqueId(),
        type: 'image',
        src: data.data.image,
        fixedRatio: false,
        left: imagePosition.left,
        top: imagePosition.top,
        width: finalImageWidth,
        height: finalImageHeight,
      } as PPTImageElement,
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

export const convertToSlide = (data: any, viewport: SlideViewport, theme: SlideTheme) => {
  if (data.type === 'two_column_with_image') {
    return convertTwoColumnWithImage(data, viewport, theme);
  }
  if (data.type === 'main_image') {
    return convertMainImage(data, viewport, theme);
  }
  throw new Error('Unsupported layout type');
};
