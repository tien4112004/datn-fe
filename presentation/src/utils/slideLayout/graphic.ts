import type {
  PPTLineElement,
  PPTImageElement,
  PPTTextElement,
  ImageElementClip,
  SlideTheme,
} from '@/types/slides';
import { generateUniqueId } from './utils';
import { getImageSize } from '../image';
import { calculateFontSizeForAvailableSpace } from './fontSizeCalculator';
import type { SlideViewport, SlideLayoutCalculator } from './slideLayout';

export const createImageElement = async (
  src: string,
  bounds: { left: number; top: number; width: number; height: number },
  options: { fixedRatio?: boolean; clip?: ImageElementClip | 'auto'; rotate?: number } = {}
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
    fixedRatio: options.fixedRatio ?? true,
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
    rotate: options.rotate ?? 0,
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
  availableBlock: { left: number; top: number; width: number; height: number },
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

export const createTitleLine = (
  titleDimensions: { width: number; height: number; left: number; top: number },
  theme: SlideTheme
) => {
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
