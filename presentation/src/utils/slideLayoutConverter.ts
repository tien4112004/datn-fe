import type { PPTTextElement, PPTImageElement, Slide } from '@/types/slides';
import { SlideLayoutCalculator, type SlideViewport } from './slideLayout';

export interface TwoColumnWithImageLayoutSchema {
  type: string;
  title: string;
  data: {
    image: string;
    items: string[];
  };
}

export interface Theme {
  title: {
    fontName: string;
    fontSize: number;
    color: string;
  };
  text: {
    fontName: string;
    fontSize: number;
    color: string;
  };
}

function formatTitleContent(content: string, fontSize: number): string {
  return `<p style="text-align: center;"><strong><span style="font-size: ${fontSize}px;">${content}</span></strong></p>`;
}

function formatItemContent(content: string, fontSize: number): string {
  return `<p style="text-align: left;"><span style="font-size: ${fontSize}px;">${content}</span></p>`;
}

// Content analysis functions
function calculateTotalContentLength(items: string[]): number {
  return items.reduce((total, item) => total + item.length, 0);
}

function getAdaptiveStyles(
  items: string[],
  baseTheme: Theme,
  viewport: SlideViewport
): { fontSize: number; lineHeight: number } {
  const totalLength = calculateTotalContentLength(items);
  const averageLength = totalLength / items.length;
  const maxLength = Math.max(...items.map((item) => item.length));

  const baseFontSize = baseTheme.text.fontSize;
  let adaptiveFontSize = baseFontSize;
  let lineHeight = 1.4;

  if (items.length > 6) {
    adaptiveFontSize = Math.max(baseFontSize * 0.8, 12);
    lineHeight = 1.2;
  } else if (averageLength > 80) {
    adaptiveFontSize = Math.max(baseFontSize * 0.85, 14);
    lineHeight = 1.3;
  } else if (maxLength > 120) {
    adaptiveFontSize = Math.max(baseFontSize * 0.75, 12);
    lineHeight = 1.2;
  } else if (items.length <= 3 && averageLength < 30) {
    adaptiveFontSize = Math.min(baseFontSize * 1.1, 20);
    lineHeight = 1.5;
  }

  return { fontSize: adaptiveFontSize, lineHeight };
}

function formatItemContentWithLineHeight(content: string, fontSize: number, lineHeight: number): string {
  return `<p style="text-align: left; line-height: ${lineHeight};"><span style="font-size: ${fontSize}px;">${content}</span></p>`;
}

export const convertTwoColumnWithImage = (
  data: TwoColumnWithImageLayoutSchema,
  viewport: SlideViewport,
  theme: Theme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio);

  // Get adaptive styles based on content analysis
  const adaptiveStyles = getAdaptiveStyles(data.data.items, theme, viewport);

  // Format content and calculate dimensions
  const titleContent = formatTitleContent(data.title, theme.title.fontSize);
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

  // Calculate positions using variable heights
  const itemPositions = layoutCalculator.getItemPositionsWithVariableHeights(
    itemContentsAndDimensions.map((item) => item.dimensions),
    1 // Column index 1 (right column)
  );

  // Create slide elements
  const slide: Slide = {
    id: 'unique',
    elements: [
      {
        id: 'test',
        type: 'text',
        content: titleContent,
        defaultFontName: theme.title.fontName,
        defaultColor: theme.title.color,
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
          defaultFontName: theme.text.fontName,
          defaultColor: theme.text.color,
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
