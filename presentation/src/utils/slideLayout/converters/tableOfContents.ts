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
import type { TableOfContentsLayoutSchema, TwoColumnLayoutSchema } from './types';
import { convertTwoColumn } from './twoColumn';

export const convertTableOfContents = async (
  data: TableOfContentsLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Numbering
  const numberedItems = data.data.items.map((item, index) => `${index + 1}. ${item}`);

  // If too many items, switch to two-column layout
  if (numberedItems.length >= 8) {
    const newData = {
      type: 'two_column',
      data: {
        title: 'Contents',
        items1: numberedItems.slice(0, Math.ceil(numberedItems.length / 2)),
        items2: numberedItems.slice(Math.ceil(numberedItems.length / 2)),
      },
    } as TwoColumnLayoutSchema;

    return await convertTwoColumn(newData, viewport, theme);
  }

  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Title "Contents"
  const titleText = 'Contents';
  const titleAvailableBlock = {
    left: 0,
    top: 15,
    width: layoutCalculator.slideWidth,
    height: 100,
  };
  const { titleContent, titleDimensions, titlePosition } = calculateTitleLayout(
    titleText,
    titleAvailableBlock,
    layoutCalculator,
    theme
  );

  // Calculate available block for table of contents items
  const tocContentBlock = {
    left: 0,
    top: titlePosition.top + titleDimensions.height + 40, // Position below title with spacing
    width: layoutCalculator.slideWidth,
    height: layoutCalculator.slideHeight - (titlePosition.top + titleDimensions.height) - 40,
  };

  // Calculate unified styles for items using element-based approach
  const tempItemElements4 = numberedItems.map((item) =>
    createItemElement({
      content: item,
      fontSize: 20, // Initial size, will be optimized
      lineHeight: 1.4,
      fontFamily: theme.fontName,
      color: theme.fontColor,
    })
  );
  const contentStyles: ItemStyles = calculateFontSizeForAvailableSpace(
    tempItemElements4,
    tocContentBlock.width,
    tocContentBlock.height,
    viewport
  );

  // Apply the calculated styles to the temporary elements
  applyFontSizeToElements(tempItemElements4, contentStyles);

  // Create item elements for table of contents
  const items = await createItemElementsWithStyles(
    numberedItems,
    tocContentBlock,
    layoutCalculator,
    theme,
    contentStyles,
    { alignment: 'top', leftMargin: 60 } // Increased left margin for better aesthetics
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
      ...items,
    ],
  };

  return slide;
};
