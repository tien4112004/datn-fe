import type { Slide, SlideTheme } from '@/types/slides';
import {
  SlideLayoutCalculator,
  type SlideViewport,
  type ElementBounds,
  type ImageBounds,
} from '../slideLayout';
import { calculateFontSizeForAvailableSpace, applyFontSizeToElements } from '../fontSizeCalculator';
import { createItemElement } from '../htmlTextCreation';
import { generateUniqueId } from '../utils';
import {
  createImageElement,
  createItemElementsWithStyles,
  createTitlePPTElement,
  calculateTitleLayout,
  type ItemStyles,
  createTitleLine,
} from '../graphic';
import type { TwoColumnWithImageLayoutSchema } from './types';

export const convertTwoColumnWithImage = async (
  data: TwoColumnWithImageLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Calculate available space for content column (column 1, right side)
  const columns = layoutCalculator.getColumnsLayout([50, 50]);
  const contentColumnBlock = columns[1];

  // Calculate title layout using the new helper
  const titleAvailableBlock = {
    left: 0,
    top: 15,
    width: layoutCalculator.slideWidth,
    height: 120,
  };
  const { titleContent, titleDimensions, titlePosition } = calculateTitleLayout(
    data.title,
    titleAvailableBlock,
    layoutCalculator,
    theme
  );
  const imageDimensions = layoutCalculator.calculateImageDimensions();

  //   // Get image position in first column
  //   const imagePosition = layoutCalculator.getColumnCenterPosition(
  //     imageDimensions.height,
  //     imageDimensions.width,
  //     0
  //   );
  const imagePosition = layoutCalculator.layoutItemInBlock(imageDimensions, columns[0], {
    alignment: 'center',
  });

  // Calculate unified styles for items using element-based approach
  const contentAvailableBlock = {
    ...contentColumnBlock,
    top: contentColumnBlock.top + titleDimensions.height + 60,
    height: contentColumnBlock.height - titleDimensions.height,
  };

  const tempItemElements = data.data.items.map((item) =>
    createItemElement({
      content: item,
      fontSize: 20, // Initial size, will be optimized
      lineHeight: 1.4,
      fontFamily: theme.fontName,
      color: theme.fontColor,
    })
  );
  const contentStyles: ItemStyles = calculateFontSizeForAvailableSpace(
    tempItemElements,
    contentAvailableBlock.width,
    contentAvailableBlock.height,
    viewport
  );

  // Apply the calculated styles to the temporary elements
  applyFontSizeToElements(tempItemElements, contentStyles);

  // Create item elements using the unified styles
  const itemElements = await createItemElementsWithStyles(
    data.data.items,
    contentAvailableBlock,
    layoutCalculator,
    theme,
    contentStyles,
    { alignment: 'top', leftMargin: 0 }
  );

  // Create slide elements
  const slide: Slide = {
    id: generateUniqueId(),
    elements: [
      createTitlePPTElement(
        titleContent,
        { left: titlePosition.left, top: titlePosition.top },
        { width: titleDimensions.width, height: titleDimensions.height },
        theme
      ),
      await createImageElement(
        data.data.image,
        {
          ...imagePosition,
          ...imageDimensions,
        } as ImageBounds,
        { clip: 'auto' }
      ),
      // Graphic elements
      createTitleLine(
        {
          width: titleDimensions.width,
          height: titleDimensions.height,
          left: titlePosition.left,
          top: titlePosition.top,
        } as ElementBounds,
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
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

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

  // Calculate title layout using the new helper
  const titleAvailableBlock = {
    left: contentColumnBlock.left,
    top: 15,
    width: contentColumnBlock.width,
    height: 240,
  };
  const { titleContent, titleDimensions, titlePosition } = calculateTitleLayout(
    data.title,
    titleAvailableBlock,
    layoutCalculator,
    theme
  );

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

  // Calculate unified styles for items using element-based approach
  const tempItemElements2 = data.data.items.map((item) =>
    createItemElement({
      content: item,
      fontSize: 20, // Initial size, will be optimized
      lineHeight: 1.4,
      fontFamily: theme.fontName,
      color: theme.fontColor,
    })
  );
  const contentStyles: ItemStyles = calculateFontSizeForAvailableSpace(
    tempItemElements2,
    customAvailableBlock.width,
    customAvailableBlock.height,
    viewport
  );

  // Apply the calculated styles to the temporary elements
  applyFontSizeToElements(tempItemElements2, contentStyles);

  const itemElements = await createItemElementsWithStyles(
    data.data.items,
    customAvailableBlock,
    layoutCalculator,
    theme,
    contentStyles,
    { alignment: 'top', leftMargin: 40 }
  );

  // Create slide elements
  const slide: Slide = {
    id: generateUniqueId(),
    elements: [
      createTitlePPTElement(
        titleContent,
        { left: titlePosition.left, top: titlePosition.top },
        { width: titleDimensions.width, height: titleDimensions.height },
        theme
      ),
      await createImageElement(
        data.data.image,
        { left: 0, top: 0, width: imageWidth, height: imageHeight } as ImageBounds,
        { clip: 'auto' }
      ),
      //   Graphic elements
      createTitleLine(
        {
          width: titleDimensions.width,
          height: titleDimensions.height,
          left: titlePosition.left,
          top: titlePosition.top,
        } as ElementBounds,
        theme
      ),
      // Item text elements with variable height positioning
      ...itemElements,
    ],
  };

  return slide;
};
