import type { Slide } from '@/types/slides';
import { SlideLayoutCalculator, type SlideViewport, type ElementBounds } from '../slideLayout';
import { generateUniqueId } from '../utils';
import {
  createTitlePPTElement,
  calculateTitleLayout,
  createTitleLine,
  calculateRowDistribution,
  createHorizontalItemBlocks,
  createHorizontalItemElements,
} from '../graphic';
import type { HorizontalListLayoutSchema } from './types';
import type { ExtendedSlideTheme } from '../theme';

export const convertHorizontalList = async (
  data: HorizontalListLayoutSchema,
  viewport: SlideViewport,
  theme: ExtendedSlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Calculate title layout
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

  // Calculate available space for horizontal items
  const contentTopMargin = titlePosition.top + titleDimensions.height + 60; // Space after title and line
  const contentBottomMargin = 40; // Bottom margin
  const actualContentHeight = layoutCalculator.slideHeight - contentTopMargin - contentBottomMargin;

  const contentAvailableBlock = {
    left: 40, // Left margin
    top: contentTopMargin,
    width: layoutCalculator.slideWidth - 80, // Left and right margins
    height: actualContentHeight,
  };

  // Calculate row distribution
  const { topRowItems, bottomRowItems } = calculateRowDistribution(data.data.items.length);

  // Calculate column width based on the row with more items
  const maxItemsPerRow = Math.max(topRowItems, bottomRowItems || 0);
  const columnWidth = contentAvailableBlock.width / maxItemsPerRow;

  // Create horizontal item blocks
  const itemBlocks = createHorizontalItemBlocks(
    data.data.items,
    columnWidth,
    contentAvailableBlock.height,
    layoutCalculator,
    theme,
    viewport
  );

  // Create horizontal item elements
  const itemElements = await createHorizontalItemElements(
    itemBlocks,
    contentAvailableBlock,
    layoutCalculator,
    theme
  );

  // Create slide
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
};
