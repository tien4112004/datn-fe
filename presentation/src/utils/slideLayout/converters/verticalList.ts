import type { Slide, SlideTheme } from '@/types/slides';
import { SlideLayoutCalculator, type SlideViewport, type ElementBounds } from '../slideLayout';
import { generateUniqueId } from '../utils';
import {
  createTitlePPTElement,
  calculateTitleLayout,
  createTitleLine,
  createItemElementsWithHTMLElements,
} from '../graphic';
import type { VerticalListLayoutSchema } from './types';

export const convertVerticalList = async (
  data: VerticalListLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Title using element-based approach
  const titleAvailableBlock = {
    left: 0,
    top: 15,
    width: layoutCalculator.slideWidth,
    height: 100,
  };
  const { titleElement, titleContent, titleDimensions, titlePosition } = calculateTitleLayout(
    data.title,
    titleAvailableBlock,
    layoutCalculator,
    theme
  );

  const titleBottomSpacing = 60;
  const items = data.data.items;

  // Auto-wrapping logic: if items > 5, split into two columns
  if (items.length > 5) {
    // Split into two columns
    const columns = layoutCalculator.getColumnsLayout([50, 50]);
    const leftColumnBlock = {
      ...columns[0],
      height: layoutCalculator.calculateAvailableHeight(40, 40),
    };
    const rightColumnBlock = {
      ...columns[1],
      height: layoutCalculator.calculateAvailableHeight(40, 40),
    };

    const columnContentHeight = leftColumnBlock.height - titleDimensions.height - titleBottomSpacing;

    // Split items into two columns
    const midpoint = Math.ceil(items.length / 2);
    const leftItems = items.slice(0, midpoint);
    const rightItems = items.slice(midpoint);

    // Create item elements for each column using the new element-based approach
    const leftItemElements = await createItemElementsWithHTMLElements(
      leftItems,
      {
        ...leftColumnBlock,
        top: leftColumnBlock.top + titleDimensions.height + titleBottomSpacing,
        height: columnContentHeight,
      },
      layoutCalculator,
      theme,
      viewport,
      { alignment: 'top', leftMargin: 20 }
    );

    const rightItemsElements = await createItemElementsWithHTMLElements(
      rightItems,
      {
        ...rightColumnBlock,
        top: rightColumnBlock.top + titleDimensions.height + titleBottomSpacing,
        height: columnContentHeight,
      },
      layoutCalculator,
      theme,
      viewport,
      { alignment: 'top', leftMargin: 20 }
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
        ...leftItemElements,
        ...rightItemsElements,
      ],
    };

    return slide;
  } else {
    // Single column layout for 5 or fewer items
    const singleColumnBlock = {
      left: 0,
      top: titlePosition.top + titleDimensions.height + titleBottomSpacing,
      width: layoutCalculator.slideWidth,
      height: layoutCalculator.calculateAvailableHeight(40, 40) - titleDimensions.height - titleBottomSpacing,
    };

    // Create item elements using the new element-based approach
    const itemElements = await createItemElementsWithHTMLElements(
      items,
      singleColumnBlock,
      layoutCalculator,
      theme,
      viewport,
      { alignment: 'top', leftMargin: 60 }
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
        ...itemElements,
      ],
    };

    return slide;
  }
};
