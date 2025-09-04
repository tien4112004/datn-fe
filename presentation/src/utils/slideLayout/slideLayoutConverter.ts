import type {
  PPTTextElement,
  PPTImageElement,
  Slide,
  SlideTheme,
  PPTLineElement,
  ImageElementClip,
} from '@/types/slides';
import { SlideLayoutCalculator, type SlideViewport } from './slideLayout';
import { calculateFontSizeForAvailableSpace, calculateLargestOptimalFontSize } from './fontSizeCalculator';
import { generateUniqueId } from './utils';
import { createTitleLine, createImageElement, createItemElements } from './graphic';
import { getImageSize } from '../image';

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

export const convertTwoColumnWithImage = async (
  data: TwoColumnWithImageLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio);

  // Calculate available space for content column (column 1, right side)
  const columns = layoutCalculator.getColumnsLayout([50, 50]);
  const contentColumnBlock = {
    ...columns[1],
    height: layoutCalculator.calculateAvailableHeight(100, 40),
  };

  // Calculate title dimensions and font size based on available width
  const titleAvailableWidth = layoutCalculator.slideWidth * 0.9; // 90% of slide width
  const titleAvailableHeight = Math.max(120, layoutCalculator.slideHeight * 0.15); // Responsive title height
  const titleFontSize = calculateLargestOptimalFontSize(
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

  // Create item elements using the helper
  const itemElements = await createItemElements(
    data.data.items,
    contentColumnBlock,
    layoutCalculator,
    theme,
    viewport,
    { alignment: 'center', leftMargin: 40 }
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
      await createImageElement(data.data.image, { ...imagePosition, ...imageDimensions }),
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
      ...itemElements,
    ],
  };

  return slide;
};

export const convertTwoColumnWithBigImage = async (
  data: TwoColumnWithImageLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio);

  // Use flexible column layout: 33% for image, 67% for content
  const columns = layoutCalculator.getColumnsLayout([33, 67]);
  const leftColumnBlock = columns[0];
  const contentColumnBlock = {
    ...columns[1],
    height: layoutCalculator.calculateAvailableHeight(0, 20),
  };

  // Calculate image dimensions to fit nicely in left column
  const imageHeight = viewport.size * viewport.ratio;
  const imageWidth = leftColumnBlock.width;

  // Calculate title dimensions and position - position in the combined content area
  const titleAvailableWidth = contentColumnBlock.width;
  const titleAvailableHeight = 240;
  const titleFontSize = calculateLargestOptimalFontSize(
    data.title,
    titleAvailableWidth,
    titleAvailableHeight,
    'title'
  );
  const titleContent = formatTitleContent(data.title, titleFontSize);
  const titleDimensions = layoutCalculator.calculateTextDimensions(titleContent);
  const titlePosition = {
    left: contentColumnBlock.left + (contentColumnBlock.width - titleDimensions.width) / 2,
    top: 15,
  };

  const contentAvailableWidth = contentColumnBlock.width;
  const contentAvailableHeight = contentColumnBlock.height - 160; // Reserve space for title

  const titleBottomOffset = titlePosition.top + titleDimensions.height + 40; // 40px spacing after title

  // Create item elements using the helper with custom available block
  const customAvailableBlock = {
    left: contentColumnBlock.left,
    top: titleBottomOffset,
    width: contentAvailableWidth,
    height: contentAvailableHeight,
  };
  const itemElements = await createItemElements(
    data.data.items,
    customAvailableBlock,
    layoutCalculator,
    theme,
    viewport,
    { alignment: 'top', leftMargin: 40 }
  );

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
        left: titlePosition.left,
        top: titlePosition.top,
        width: titleDimensions.width,
        height: titleDimensions.height,
      } as PPTTextElement,
      await createImageElement(
        data.data.image,
        { left: 0, top: 0, width: imageWidth, height: imageHeight },
        { clip: 'auto' }
      ),
      //   Graphic elements
      createTitleLine(
        {
          width: titleDimensions.width,
          height: titleDimensions.height,
          left: titlePosition.left,
          top: titlePosition.top,
        },
        theme
      ),
      // Item text elements with variable height positioning
      ...itemElements,
    ],
  };

  return slide;
};

export const convertMainImage = async (
  data: MainImageLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
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
  const contentFontSize = calculateLargestOptimalFontSize(
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
      await createImageElement(data.data.image, {
        ...imagePosition,
        width: finalImageWidth,
        height: finalImageHeight,
      }),
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

export const convertToSlide = async (data: any, viewport: SlideViewport, theme: SlideTheme) => {
  if (data.type === 'two_column_with_image') {
    return await convertTwoColumnWithImage(data, viewport, theme);
  }
  if (data.type === 'two_column_with_big_image') {
    return await convertTwoColumnWithBigImage(data, viewport, theme);
  }
  if (data.type === 'main_image') {
    return await convertMainImage(data, viewport, theme);
  }
  throw new Error('Unsupported layout type');
};
