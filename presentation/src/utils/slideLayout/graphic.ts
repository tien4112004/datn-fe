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

function formatItemContentWithLineHeight(content: string, fontSize: number, lineHeight: number): string {
  return `<p style="text-align: left; line-height: ${lineHeight};"><span style="font-size: ${fontSize}px;">${content}</span></p>`;
}

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
    defaultFontName: theme.fontName,
    defaultColor: theme.fontColor,
    left: position.left,
    top: position.top,
    width: dimensions.width,
    height: dimensions.height,
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
