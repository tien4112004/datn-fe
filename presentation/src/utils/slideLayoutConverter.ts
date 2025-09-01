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

export const convertTwoColumnWithImage = (
  data: TwoColumnWithImageLayoutSchema,
  viewport: SlideViewport,
  theme: Theme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio);

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

      // Item text elements
      ...data.data.items.map((item, index) => {
        const itemContent = formatItemContent(item, theme.text.fontSize);
        const itemDimensions = layoutCalculator.calculateTextDimensions(itemContent);
        const itemPosition = layoutCalculator.getItemPositionInAutoLayout(
          itemDimensions.height,
          itemDimensions.width,
          index,
          data.data.items.length,
          1
        );

        return {
          id: `item-${index}`,
          type: 'text',
          content: itemContent,
          defaultFontName: theme.text.fontName,
          defaultColor: theme.text.color,
          left: itemPosition.left,
          top: itemPosition.top,
          width: itemDimensions.width,
          height: itemDimensions.height,
        } as PPTTextElement;
      }),
    ],
  };

  return slide;
};
