import type { PPTTextElement, PPTImageElement, Slide, SlideTheme } from '@/types/slides';
import { SlideLayoutCalculator, type SlideViewport } from './slideLayout';

// TODO: Refactor this file, it is getting too large

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

// Content analysis functions
// function calculateTotalContentLength(items: string[]): number {
//   return items.reduce((total, item) => total + item.length, 0);
// }

function calculateOptimalFontSize(
  content: string,
  availableWidth: number,
  availableHeight: number,
  role: 'title' | 'content' = 'content'
): number {
  // Create a temporary element to measure text
  const measureElement = document.createElement('div');
  measureElement.innerHTML = content;
  measureElement.style.cssText = `
    position: absolute;
    visibility: hidden;
    top: -9999px;
    left: -9999px;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
  `;

  document.body.appendChild(measureElement);

  // Binary search for optimal font size
  let minFontSize = role === 'title' ? 16 : 10;
  let maxFontSize = role === 'title' ? 60 : 32;
  let optimalFontSize = minFontSize;

  // Binary search with precision of 0.5px
  while (maxFontSize - minFontSize > 0.5) {
    const testFontSize = (minFontSize + maxFontSize) / 2;

    // Set test font size and measure
    measureElement.style.fontSize = `${testFontSize}px`;
    measureElement.style.width = `${availableWidth}px`;
    measureElement.style.lineHeight = role === 'title' ? '1.2' : '1.4';

    const measuredWidth = measureElement.scrollWidth;
    const measuredHeight = measureElement.scrollHeight;

    // Check if text fits within available space
    if (measuredWidth <= availableWidth && measuredHeight <= availableHeight) {
      optimalFontSize = testFontSize;
      minFontSize = testFontSize;
    } else {
      maxFontSize = testFontSize;
    }
  }

  document.body.removeChild(measureElement);

  // Apply role-specific constraints
  if (role === 'title') {
    return Math.max(Math.min(optimalFontSize, 48), 18);
  } else {
    return Math.max(Math.min(optimalFontSize, 24), 12);
  }
}

function calculateFontSizeForAvailableSpace(
  items: string[],
  availableWidth: number,
  availableHeight: number,
  viewport: SlideViewport
): { fontSize: number; lineHeight: number; spacing: number } {
  if (items.length === 0) {
    return { fontSize: 16, lineHeight: 1.4, spacing: 12 };
  }

  // Calculate adaptive spacing based on content count and available height
  let spacing: number;
  if (items.length <= 3) {
    spacing = Math.min(24, availableHeight * 0.08); // More generous spacing for few items
  } else if (items.length <= 6) {
    spacing = Math.min(16, availableHeight * 0.05); // Medium spacing
  } else {
    spacing = Math.min(10, availableHeight * 0.03); // Tighter spacing for many items
  }

  // Ensure minimum spacing
  spacing = Math.max(spacing, 6);

  // Calculate available height per item (including spacing)
  const totalSpacing = (items.length - 1) * spacing;
  const availableContentHeight = availableHeight - totalSpacing;
  const avgHeightPerItem = availableContentHeight / items.length;

  // Find the optimal font size that fits all items
  let optimalFontSize = 28; // Start with max reasonable size

  for (const item of items) {
    const itemFontSize = calculateOptimalFontSize(
      `<span>${item}</span>`,
      availableWidth,
      avgHeightPerItem,
      'content'
    );
    optimalFontSize = Math.min(optimalFontSize, itemFontSize);
  }

  // Test if all items actually fit with this font size and spacing
  let totalRequiredHeight = 0;
  const testElement = document.createElement('div');
  testElement.style.cssText = `
    position: absolute;
    visibility: hidden;
    top: -9999px;
    left: -9999px;
    width: ${availableWidth}px;
    font-size: ${optimalFontSize}px;
    line-height: 1.4;
    word-wrap: break-word;
    overflow-wrap: break-word;
  `;

  document.body.appendChild(testElement);

  for (const item of items) {
    testElement.innerHTML = `<span>${item}</span>`;
    totalRequiredHeight += testElement.scrollHeight;
  }

  document.body.removeChild(testElement);

  // If total height exceeds available space, reduce font size and adjust spacing
  const totalRequiredWithSpacing = totalRequiredHeight + totalSpacing;
  if (totalRequiredWithSpacing > availableHeight) {
    const scaleFactor = availableHeight / totalRequiredWithSpacing;
    optimalFontSize *= scaleFactor * 0.92; // 8% safety margin

    // Also reduce spacing proportionally if needed
    if (scaleFactor < 0.8) {
      spacing *= Math.max(scaleFactor * 1.2, 0.6); // Reduce spacing but not too much
      spacing = Math.max(spacing, 4); // Minimum spacing
    }
  }

  // Calculate appropriate line height based on font size
  let lineHeight = 1.4;
  if (optimalFontSize <= 14) {
    lineHeight = 1.3;
  } else if (optimalFontSize >= 20) {
    lineHeight = 1.5;
  }

  // Adjust line height for content density
  if (items.length > 6) {
    lineHeight *= 0.95; // Slightly tighter for many items
  } else if (items.length <= 2) {
    lineHeight *= 1.1; // More generous for few items
  }

  return {
    fontSize: Math.max(Math.min(optimalFontSize, 28), 12),
    lineHeight,
    spacing: Math.round(spacing),
  };
}

// function getAdaptiveStyles(
//   items: string[],
//   baseTheme: Theme,
//   viewport: SlideViewport
// ): { fontSize: number; lineHeight: number } {
//   const totalLength = calculateTotalContentLength(items);
//   const averageLength = totalLength / items.length;
//   const maxLength = Math.max(...items.map((item) => item.length));

//   const baseFontSize = baseTheme.text.fontSize;
//   let adaptiveFontSize = baseFontSize;
//   let lineHeight = 1.4;

//   if (items.length > 6) {
//     adaptiveFontSize = Math.max(baseFontSize * 0.8, 12);
//     lineHeight = 1.2;
//   } else if (averageLength > 80) {
//     adaptiveFontSize = Math.max(baseFontSize * 0.85, 14);
//     lineHeight = 1.3;
//   } else if (maxLength > 120) {
//     adaptiveFontSize = Math.max(baseFontSize * 0.75, 12);
//     lineHeight = 1.2;
//   } else if (items.length <= 3 && averageLength < 30) {
//     adaptiveFontSize = Math.min(baseFontSize * 1.1, 20);
//     lineHeight = 1.5;
//   }

//   return { fontSize: adaptiveFontSize, lineHeight };
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

  // Create slide elements
  const slide: Slide = {
    id: 'unique',
    elements: [
      {
        id: 'test',
        type: 'text',
        content: titleContent,
        defaultFontName: theme.fontName,
        defaultColor: theme.fontColor,
        left: layoutCalculator.getHorizontallyCenterPosition(titleDimensions.width),
        top: 15,
        width: titleDimensions.width,
        height: titleDimensions.height,
      } as PPTTextElement,
      {
        id: 'image',
        type: 'image',
        src: data.data.image,
        fixedRatio: false,
        left: imagePosition.left,
        top: imagePosition.top,
        width: imageDimensions.width,
        height: imageDimensions.height,
      } as PPTImageElement,

      // Item text elements with variable height positioning
      ...itemContentsAndDimensions.map((item, index) => {
        const position = itemPositions[index];

        return {
          id: `item-${index}`,
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
    id: 'unique',
    elements: [
      {
        id: 'main-image',
        type: 'image',
        src: data.data.image,
        fixedRatio: false,
        left: imagePosition.left,
        top: imagePosition.top,
        width: finalImageWidth,
        height: finalImageHeight,
      } as PPTImageElement,
      {
        id: 'content-text',
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
