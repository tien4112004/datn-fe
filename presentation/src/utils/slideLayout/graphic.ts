import type {
  PPTLineElement,
  PPTImageElement,
  PPTTextElement,
  ImageElementClip,
  SlideTheme,
} from '@/types/slides';
import { generateUniqueId } from './utils';
import { getImageSize } from '../image';
import { calculateFontSizeForAvailableSpace, calculateLargestOptimalFontSize } from './fontSizeCalculator';
import type {
  SlideViewport,
  SlideLayoutCalculator,
  ImageBounds,
  LayoutBlock,
  Size,
  ElementBounds,
} from './slideLayout';

export const createImageElement = async (
  src: string,
  bounds: ImageBounds,
  options: { clip?: ImageElementClip | 'auto' } = {}
): Promise<PPTImageElement> => {
  let finalClip = options.clip;

  // Auto-calculate clip range when clip is 'auto'
  if (options.clip === 'auto') {
    const imageOriginalSize = await getImageSize(src);
    const imageRatio = imageOriginalSize.width / imageOriginalSize.height;

    finalClip = {
      shape: 'rect',
      range: [
        [100 / (imageRatio + 1), 0],
        [100 - 100 / (imageRatio + 1), 100],
      ],
    };
  }

  return {
    id: generateUniqueId(),
    type: 'image',
    src,
    fixedRatio: bounds.fixedRatio ?? true,
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
    rotate: bounds.rotate ?? 0,
    clip: finalClip ?? {
      shape: 'rect',
      range: [
        [0, 0],
        [100, 100],
      ],
    },
  } as PPTImageElement;
};

interface ItemLayoutOptions {
  alignment?: 'top' | 'center';
  leftMargin?: number;
}

export interface ItemStyles {
  fontSize: number;
  lineHeight: number;
  spacing: number;
}

function formatItemContentWithLineHeight(content: string, fontSize: number, lineHeight: number): string {
  return `<p style="text-align: left; line-height: ${lineHeight};"><span style="font-size: ${fontSize}px;">${content}</span></p>`;
}

/**
 * @deprecated Use createItemElementsWithUnifiedStyles instead for better consistency across layouts
 * This function will be removed in a future version.
 * Migration: Replace with createItemElementsWithUnifiedStyles and pass unified styles calculated with calculateFontSizeForAvailableSpace
 */
export const createItemElements = async (
  items: string[],
  availableBlock: LayoutBlock,
  layoutCalculator: SlideLayoutCalculator,
  theme: SlideTheme,
  viewport: SlideViewport,
  options: ItemLayoutOptions = {}
): Promise<PPTTextElement[]> => {
  // Get adaptive styles based on available space
  const adaptiveStyles = calculateFontSizeForAvailableSpace(
    items,
    availableBlock.width,
    availableBlock.height,
    viewport
  );

  // Pre-calculate all item dimensions using the actual available block
  const itemContentsAndDimensions = items.map((item) => {
    const itemContent = formatItemContentWithLineHeight(
      item,
      adaptiveStyles.fontSize,
      adaptiveStyles.lineHeight
    );
    const itemDimensions = layoutCalculator.calculateTextDimensionsForBlock(itemContent, availableBlock, {
      widthUtilization: 0.9,
    });
    return { content: itemContent, dimensions: itemDimensions };
  });

  // Calculate positions using the new unified method
  const itemPositions = layoutCalculator.layoutItemsInBlock(
    itemContentsAndDimensions.map((item) => item.dimensions),
    availableBlock,
    adaptiveStyles.spacing,
    options
  );

  // Create PPTTextElement objects
  return itemContentsAndDimensions.map((item, index) => {
    const position = itemPositions[index];

    return {
      id: generateUniqueId(),
      type: 'text',
      content: item.content,
      defaultFontName: theme.fontName,
      defaultColor: theme.fontColor,
      left: position.left,
      top: position.top,
      width: position.width,
      height: position.height,
      textType: 'content',
    } as PPTTextElement;
  });
};

export const createItemElementsWithStyles = async (
  items: string[],
  availableBlock: LayoutBlock,
  layoutCalculator: SlideLayoutCalculator,
  theme: SlideTheme,
  itemStyles: ItemStyles,
  options: ItemLayoutOptions = {}
): Promise<PPTTextElement[]> => {
  // Pre-calculate all item dimensions using the unified styles
  const itemContentsAndDimensions = items.map((item) => {
    const itemContent = formatItemContentWithLineHeight(item, itemStyles.fontSize, itemStyles.lineHeight);
    const itemDimensions = layoutCalculator.calculateTextDimensionsForBlock(itemContent, availableBlock);
    return { content: itemContent, dimensions: itemDimensions };
  });

  // Calculate positions using the unified spacing
  const itemPositions = layoutCalculator.layoutItemsInBlock(
    itemContentsAndDimensions.map((item) => item.dimensions),
    availableBlock,
    itemStyles.spacing,
    options
  );

  // Create PPTTextElement objects
  return itemContentsAndDimensions.map((item, index) => {
    const position = itemPositions[index];

    return {
      id: generateUniqueId(),
      type: 'text',
      content: item.content,
      defaultFontName: theme.fontName,
      defaultColor: theme.fontColor,
      left: position.left,
      top: position.top,
      width: position.width,
      height: position.height,
      textType: 'content',
    } as PPTTextElement;
  });
};

interface TitleLayoutOptions {
  horizontalAlignment?: 'left' | 'center' | 'right';
  topOffset?: number;
}

function formatTitleContent(content: string, fontSize: number): string {
  return `<p style="text-align: center;"><strong><span style="font-size: ${fontSize}px;">${content}</span></strong></p>`;
}

export const calculateTitleLayout = (
  title: string,
  availableBlock: LayoutBlock,
  layoutCalculator: SlideLayoutCalculator,
  options: TitleLayoutOptions = {}
) => {
  const { horizontalAlignment = 'center', topOffset } = options;

  // Calculate optimal font size using the available block dimensions
  const titleFontSize = calculateLargestOptimalFontSize(
    title,
    availableBlock.width,
    availableBlock.height,
    'title'
  );

  // Format the title content
  const titleContent = formatTitleContent(title, titleFontSize);

  // Calculate title dimensions
  const titleDimensions = layoutCalculator.calculateTitleDimensions(titleContent);

  // Calculate horizontal position based on alignment
  let horizontalPosition: number;
  switch (horizontalAlignment) {
    case 'left':
      horizontalPosition = availableBlock.left;
      break;
    case 'right':
      horizontalPosition = availableBlock.left + availableBlock.width - titleDimensions.width;
      break;
    case 'center':
    default:
      horizontalPosition = availableBlock.left + (availableBlock.width - titleDimensions.width) / 2;
      break;
  }

  // Calculate vertical position
  const verticalPosition = topOffset !== undefined ? topOffset : availableBlock.top;

  const titlePosition = {
    left: horizontalPosition,
    top: verticalPosition,
  };

  return {
    titleContent,
    titleDimensions,
    titlePosition,
    titleFontSize,
  };
};

export const createTitleElement = (
  content: string,
  position: { left: number; top: number },
  dimensions: { width: number; height: number },
  theme: SlideTheme
): PPTTextElement => {
  return {
    id: generateUniqueId(),
    type: 'text',
    content,
    defaultFontName: theme.titleFontName || theme.fontName,
    defaultColor: theme.titleFontColor || theme.fontColor,
    left: position.left,
    top: position.top,
    width: dimensions.width,
    height: dimensions.height,
    textType: 'title',
  } as PPTTextElement;
};

export const createTitleLine = (titleDimensions: ElementBounds, theme: SlideTheme) => {
  return {
    id: generateUniqueId(),
    type: 'line',
    style: 'solid',
    left: titleDimensions.left,
    top: titleDimensions.top + titleDimensions.height + 10,
    start: [0, 0],
    end: [titleDimensions.width, 0],
    width: 2,
    color: theme.themeColors[0],
    points: ['', ''],
  } as PPTLineElement;
};

// ----------------------------------------------------
// Horizontal List Layout
// ----------------------------------------------------

// Utility functions for horizontal list layout
interface HorizontalItemBlock {
  labelContent: string;
  contentContent: string;
  labelDimensions: Size;
  contentDimensions: Size;
  totalHeight: number;
}

/**
 * Formats label content with proper styling
 */
function formatLabelContent(label: string, fontSize: number): string {
  return `<p style="text-align: center;"><strong><span style="font-size: ${fontSize}px;">${label}</span></strong></p>`;
}

/**
 * Formats item content with proper styling
 */
function formatHorizontalItemContent(content: string, fontSize: number, lineHeight: number): string {
  return `<p style="text-align: center; line-height: ${lineHeight};"><span style="font-size: ${fontSize}px;">${content}</span></p>`;
}

/**
 * Creates horizontal item blocks with calculated dimensions
 */
export function createHorizontalItemBlocks(
  items: { label: string; content: string }[],
  columnWidth: number,
  availableHeight: number,
  layoutCalculator: SlideLayoutCalculator,
  viewport: SlideViewport
): HorizontalItemBlock[] {
  const LABEL_CONTENT_SPACING = 10;
  const ITEM_PADDING = 10;

  return items.map((item) => {
    // Calculate available space for this item column
    const itemAvailableBlock: LayoutBlock = {
      left: 0,
      top: 0,
      width: columnWidth - ITEM_PADDING,
      height: availableHeight,
    };

    // Calculate optimal font sizes for label and content
    const labelFontSize = calculateLargestOptimalFontSize(
      item.label,
      itemAvailableBlock.width,
      availableHeight * 0.3, // Labels should take max 30% of height
      'content'
    );

    const contentFontSize = calculateLargestOptimalFontSize(
      item.content,
      itemAvailableBlock.width,
      availableHeight * 0.6, // Content should take max 60% of height
      'content'
    );

    // Format content
    const labelContent = formatLabelContent(item.label, labelFontSize);
    const contentContent = formatHorizontalItemContent(item.content, contentFontSize, contentFontSize * 1.2);

    // Calculate dimensions
    const labelDimensions = layoutCalculator.calculateTextDimensionsForBlock(
      labelContent,
      itemAvailableBlock
    );
    const contentDimensions = layoutCalculator.calculateTextDimensionsForBlock(
      contentContent,
      itemAvailableBlock
    );

    const totalHeight = labelDimensions.height + LABEL_CONTENT_SPACING + contentDimensions.height;

    return {
      labelContent,
      contentContent,
      labelDimensions,
      contentDimensions,
      totalHeight,
    };
  });
}

/**
 * Calculates row distribution for horizontal layout
 */
export function calculateRowDistribution(totalItems: number): {
  topRowItems: number;
  bottomRowItems: number;
} {
  if (totalItems <= 4) {
    return { topRowItems: totalItems, bottomRowItems: 0 };
  } else {
    // For 5+ items, distribute with top row having more if odd
    const topRowItems = Math.ceil(totalItems / 2);
    const bottomRowItems = totalItems - topRowItems;
    return { topRowItems, bottomRowItems };
  }
}

/**
 * Creates horizontal item elements positioned in rows
 */
export async function createHorizontalItemElements(
  itemBlocks: HorizontalItemBlock[],
  availableBlock: LayoutBlock,
  layoutCalculator: SlideLayoutCalculator,
  theme: SlideTheme
): Promise<PPTTextElement[]> {
  const elements: PPTTextElement[] = [];
  const { topRowItems, bottomRowItems } = calculateRowDistribution(itemBlocks.length);

  const LABEL_CONTENT_SPACING = 15;

  // Calculate the maximum height needed for alignment
  const maxTopRowHeight = Math.max(...itemBlocks.slice(0, topRowItems).map((block) => block.totalHeight));
  console.log(itemBlocks);
  const maxBottomRowHeight =
    bottomRowItems > 0 ? Math.max(...itemBlocks.slice(topRowItems).map((block) => block.totalHeight)) : 0;

  const startY = availableBlock.top;

  // Top row
  const topRowWidth = availableBlock.width;
  const topColumnWidth = topRowWidth / topRowItems;

  for (let i = 0; i < topRowItems; i++) {
    const block = itemBlocks[i];
    const columnLeft = availableBlock.left + i * topColumnWidth;
    const columnCenterX = columnLeft + topColumnWidth / 2;

    // Center items within their column
    const labelLeft = columnCenterX - block.labelDimensions.width / 2;
    const contentLeft = columnCenterX - block.contentDimensions.width / 2;

    // Align items vertically within the row
    const itemStartY = startY + (maxTopRowHeight - block.totalHeight) / 2;

    // Create label element
    elements.push({
      id: generateUniqueId(),
      type: 'text',
      content: block.labelContent,
      defaultFontName: theme.fontName,
      defaultColor: theme.fontColor,
      left: labelLeft,
      top: itemStartY,
      width: block.labelDimensions.width,
      height: block.labelDimensions.height,
      textType: 'content',
    } as PPTTextElement);

    // Create content element
    elements.push({
      id: generateUniqueId(),
      type: 'text',
      content: block.contentContent,
      defaultFontName: theme.fontName,
      defaultColor: theme.fontColor,
      left: contentLeft,
      top: itemStartY + block.labelDimensions.height + LABEL_CONTENT_SPACING,
      width: block.contentDimensions.width,
      height: block.contentDimensions.height,
      textType: 'content',
    } as PPTTextElement);
  }

  // Bottom row (if needed)
  if (bottomRowItems > 0) {
    // TODO: Fix this
    let bottomRowY = startY + 128 + 56;
    // let bottomRowY = startY + maxTopRowHeight;
    const bottomColumnWidth = availableBlock.width / bottomRowItems;

    for (let i = 0; i < bottomRowItems; i++) {
      const block = itemBlocks[topRowItems + i];
      const columnLeft = availableBlock.left + i * bottomColumnWidth;
      const columnCenterX = columnLeft + bottomColumnWidth / 2;

      // Center items within their column
      const labelLeft = columnCenterX - block.labelDimensions.width / 2;
      const contentLeft = columnCenterX - block.contentDimensions.width / 2;

      // Align items vertically within the row
      const itemStartY = bottomRowY + (maxBottomRowHeight - block.totalHeight) / 2;

      // Create label element
      elements.push({
        id: generateUniqueId(),
        type: 'text',
        content: block.labelContent,
        defaultFontName: theme.fontName,
        defaultColor: theme.fontColor,
        left: labelLeft,
        top: itemStartY,
        width: block.labelDimensions.width,
        height: block.labelDimensions.height,
        textType: 'content',
      } as PPTTextElement);

      // Create content element
      elements.push({
        id: generateUniqueId(),
        type: 'text',
        content: block.contentContent,
        defaultFontName: theme.fontName,
        defaultColor: theme.fontColor,
        left: contentLeft,
        top: itemStartY + block.labelDimensions.height + LABEL_CONTENT_SPACING,
        width: block.contentDimensions.width,
        height: block.contentDimensions.height,
        textType: 'content',
      } as PPTTextElement);
    }
  }

  return elements;
}
