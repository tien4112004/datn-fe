import type { Slide, SlideTheme } from '@/types/slides';
import { SlideLayoutCalculator, type SlideViewport, type ElementBounds } from '../slideLayout';
import { calculateFontSizeForAvailableSpace, applyFontSizeToElements } from '../fontSizeCalculator';
import { createItemElement } from '../htmlTextCreation';
import { generateUniqueId } from '../utils';
import {
  createItemElementsWithStyles,
  createTitlePPTElement,
  calculateTitleLayout,
  type ItemStyles,
  createTitleLine,
} from '../graphic';
import type { TwoColumnLayoutSchema } from './types';

export const convertTwoColumn = async (
  data: TwoColumnLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Split slide into two equal columns
  const columns = layoutCalculator.getColumnsLayout([50, 50]);
  const leftColumnBlock = {
    ...columns[0],
    height: layoutCalculator.calculateAvailableHeight(40, 40),
  };
  const rightColumnBlock = {
    ...columns[1],
    height: layoutCalculator.calculateAvailableHeight(40, 40),
  };

  // Title
  const titleAvailableBlock = {
    left: 0,
    top: 15,
    width: layoutCalculator.slideWidth,
    height: 100,
  };
  const { titleContent, titleDimensions, titlePosition } = calculateTitleLayout(
    data.title,
    titleAvailableBlock,
    layoutCalculator,
    theme
  );

  // Create item elements for each column, positioned below the title with more spacing
  const titleBottomSpacing = 60; // Increased spacing between title and content
  const leftContentBlock = {
    ...leftColumnBlock,
    top: leftColumnBlock.top + titleDimensions.height + titleBottomSpacing,
    height: leftColumnBlock.height - titleDimensions.height - titleBottomSpacing,
  };
  const rightContentBlock = {
    ...rightColumnBlock,
    top: rightColumnBlock.top + titleDimensions.height + titleBottomSpacing,
    height: rightColumnBlock.height - titleDimensions.height - titleBottomSpacing,
  };

  // Calculate unified styles for both columns combined using element-based approach
  const allItems = [...data.data.items1, ...data.data.items2];
  const unifiedBlock = {
    left: 0,
    top: 0,
    width: leftContentBlock.width,
    height: leftContentBlock.height * 2, // Account for both columns
  };
  const tempItemElements3 = allItems.map((item) =>
    createItemElement({
      content: item,
      fontSize: 20, // Initial size, will be optimized
      lineHeight: 1.4,
      fontFamily: theme.fontName,
      color: theme.fontColor,
    })
  );
  const contentStyles: ItemStyles = calculateFontSizeForAvailableSpace(
    tempItemElements3,
    unifiedBlock.width,
    unifiedBlock.height,
    viewport
  );

  // Apply the calculated styles to the temporary elements
  applyFontSizeToElements(tempItemElements3, contentStyles);

  const leftItems = await createItemElementsWithStyles(
    data.data.items1,
    leftContentBlock,
    layoutCalculator,
    theme,
    contentStyles,
    { alignment: 'top', leftMargin: 40 }
  );
  const rightItems = await createItemElementsWithStyles(
    data.data.items2,
    rightContentBlock,
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
      createTitleLine(
        {
          width: titleDimensions.width,
          height: titleDimensions.height,
          left: titlePosition.left,
          top: titlePosition.top,
        } as ElementBounds,
        theme
      ),
      ...leftItems,
      ...rightItems,
    ],
  };

  return slide;
};
