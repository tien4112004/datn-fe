import type {
  PPTLineElement,
  PPTImageElement,
  PPTTextElement,
  ImageElementClip,
  SlideTheme,
} from '@/types/slides';
import { generateUniqueId } from './utils';
import { getImageSize } from '../image';
import {
  calculateLargestOptimalFontSize,
  calculateFontSizeForAvailableSpace,
  applyFontSizeToElements,
  applyFontSizeToElement,
} from './fontSizeCalculator';
import {
  createItemElement,
  createTitleElement,
  createLabelElement,
  createHorizontalItemContentElement,
} from './htmlTextCreation';
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
  fontFamily?: string;
}

export const createItemElementsWithHTMLElements = async (
  items: string[],
  availableBlock: LayoutBlock,
  layoutCalculator: SlideLayoutCalculator,
  theme: SlideTheme,
  viewport: SlideViewport,
  options: ItemLayoutOptions = {}
): Promise<PPTTextElement[]> => {
  // Create HTML elements for all items
  const elements = items.map((item) =>
    createItemElement({
      content: item,
      fontSize: 20, // Initial size, will be optimized
      lineHeight: 1.4,
      fontFamily: theme.fontName,
      color: theme.fontColor,
    })
  );

  // Calculate optimal styles using HTML elements
  const styles = calculateFontSizeForAvailableSpace(
    elements,
    availableBlock.width,
    availableBlock.height,
    viewport
  );

  // Apply the calculated styles to all elements
  applyFontSizeToElements(elements, styles);

  // Measure all elements with final styling
  const elementDimensions = elements.map((element) =>
    layoutCalculator.measureHTMLElementForBlock(element, availableBlock, 0.9)
  );

  // Calculate positions
  const itemPositions = layoutCalculator.layoutItemsInBlock(
    elementDimensions,
    availableBlock,
    styles.spacing,
    options
  );

  // Convert to PPT elements
  return elements.map((element, index) => {
    const position = itemPositions[index];
    const elementContent = element.outerHTML;

    return {
      id: generateUniqueId(),
      type: 'text',
      content: elementContent,
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
    const itemElement = createItemElement({
      content: item,
      fontSize: itemStyles.fontSize,
      lineHeight: itemStyles.lineHeight,
      fontFamily: itemStyles.fontFamily || theme.fontName,
      color: theme.fontColor,
    });
    const itemDimensions = layoutCalculator.measureHTMLElementForBlock(itemElement, availableBlock);
    return { content: itemElement.outerHTML, dimensions: itemDimensions };
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

export const calculateTitleLayout = (
  title: string,
  availableBlock: LayoutBlock,
  layoutCalculator: SlideLayoutCalculator,
  theme: SlideTheme,
  options: TitleLayoutOptions = {}
) => {
  const { horizontalAlignment = 'center', topOffset } = options;
  // Create title element
  const titleElement = createTitleElement({
    content: title,
    fontSize: 32, // Initial size, will be optimized
    lineHeight: 1,
    fontFamily: theme.titleFontName,
    color: theme.titleFontColor,
  });

  // Calculate optimal font size using the actual element
  const titleFontSize = calculateLargestOptimalFontSize(
    titleElement,
    availableBlock.width,
    availableBlock.height,
    'title'
  );

  // Apply the calculated font size to the element
  applyFontSizeToElement(titleElement, titleFontSize, 1.2);

  // Measure the element with optimized font size
  const titleDimensions = layoutCalculator.measureHTMLElement(titleElement);

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
    titleElement,
    titleContent: titleElement.outerHTML,
    titleDimensions,
    titlePosition,
    titleFontSize,
  };
};

export const createTitlePPTElement = (
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

interface HorizontalItemElementBlock {
  labelElement: HTMLElement;
  contentElement: HTMLElement;
  labelDimensions: Size;
  contentDimensions: Size;
  totalHeight: number;
}

/**
 * Creates horizontal item blocks using HTML elements with calculated dimensions
 */
export function createHorizontalItemBlocks(
  items: { label: string; content: string }[],
  columnWidth: number,
  availableHeight: number,
  layoutCalculator: SlideLayoutCalculator,
  theme: SlideTheme,
  viewport: SlideViewport
): HorizontalItemElementBlock[] {
  const LABEL_CONTENT_SPACING = 15;
  const ITEM_PADDING = 10;
  return items.map((item) => {
    // Calculate available space for this item column
    const itemAvailableBlock: LayoutBlock = {
      left: 0,
      top: 0,
      width: columnWidth - ITEM_PADDING,
      height: availableHeight,
    };

    // Create label and content elements
    const labelElement = createLabelElement({
      content: item.label,
      fontSize: 20, // Initial size
      lineHeight: 1.2,
      fontFamily: theme.fontName,
      color: theme.fontColor,
    });

    const contentElement = createHorizontalItemContentElement({
      content: item.content,
      fontSize: 16, // Initial size
      lineHeight: 1.4,
      fontFamily: theme.fontName,
      color: theme.fontColor,
    });

    // Calculate optimal font sizes using the actual elements
    const labelFontSize = calculateLargestOptimalFontSize(
      labelElement,
      itemAvailableBlock.width,
      availableHeight * 0.3, // Labels should take max 30% of height
      'content'
    );

    const contentFontSize = calculateLargestOptimalFontSize(
      contentElement,
      itemAvailableBlock.width,
      availableHeight * 0.7, // Content should take max 60% of height
      'content'
    );

    // Apply the calculated font sizes to the elements
    applyFontSizeToElement(labelElement, labelFontSize, 1.4);
    applyFontSizeToElement(contentElement, contentFontSize, 1.4);

    // Calculate dimensions using the optimized elements
    const labelDimensions = layoutCalculator.measureHTMLElement(labelElement);
    const contentDimensions = layoutCalculator.measureHTMLElement(contentElement, {
      maxWidth: itemAvailableBlock.width,
    });

    const totalHeight = labelDimensions.height + LABEL_CONTENT_SPACING + contentDimensions.height;

    return {
      labelElement,
      contentElement,
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
  itemBlocks: HorizontalItemElementBlock[],
  availableBlock: LayoutBlock,
  layoutCalculator: SlideLayoutCalculator,
  theme: SlideTheme
): Promise<PPTTextElement[]> {
  const elements: PPTTextElement[] = [];
  const { topRowItems, bottomRowItems } = calculateRowDistribution(itemBlocks.length);

  const LABEL_CONTENT_SPACING = 15;

  // Calculate the maximum height needed for alignment
  const maxTopRowHeight = Math.max(...itemBlocks.slice(0, topRowItems).map((block) => block.totalHeight));
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
      content: block.labelElement.outerHTML,
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
      content: block.contentElement.outerHTML,
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
    // let bottomRowY = startY + 128 + 56;
    let bottomRowY = startY + maxTopRowHeight;
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
        content: block.labelElement.outerHTML,
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
        content: block.contentElement.outerHTML,
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
