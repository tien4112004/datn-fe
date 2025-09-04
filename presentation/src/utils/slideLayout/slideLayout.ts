// Core geometric types
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle extends Size {
  left: number;
  top: number;
}

export interface Bounds extends Rectangle {}

// Semantic domain types
export interface ElementBounds extends Bounds {}

export interface ImageBounds extends ElementBounds {
  rotate?: number;
  fixedRatio?: boolean;
}

export interface TextBounds extends ElementBounds {
  fontSize?: number;
  lineHeight?: number;
}

export interface SlideViewport {
  size: number;
  ratio: number;
}

export interface TextCalculationOptions {
  maxWidthRatio?: number;
  maxHeightRatio?: number;
  padding?: number;
}

export interface LayoutBlock extends Bounds {
  /** Available space for content positioning */
}

// Legacy types - kept for compatibility
/** @deprecated Use Size instead */
export interface TextDimensions extends Size {}

/** @deprecated Use Rectangle with left/top instead of Point with x/y */
export interface Position {
  top: number;
  left: number;
}

/** @deprecated Use LayoutBlock instead */
export interface AvailableBlock extends Position, Size {}

/** @deprecated Use ElementBounds instead */
export interface ItemPosition extends AvailableBlock {}

/**
 * Main class for slide layout calculations
 */
export class SlideLayoutCalculator {
  private viewportSize: number;
  private viewportRatio: number;

  constructor(viewportSize: number, viewportRatio: number) {
    this.viewportSize = viewportSize;
    this.viewportRatio = viewportRatio;
  }

  get slideWidth(): number {
    return this.viewportSize;
  }

  get slideHeight(): number {
    return this.viewportSize * this.viewportRatio;
  }

  // Dimension Calculation Functions
  calculateTextDimensions(content: string, options?: TextCalculationOptions): Size {
    const { maxWidthRatio = 0.45, maxHeightRatio = 0.6, padding = 20 } = options || {};

    const slideWidth = this.slideWidth;
    const slideHeight = this.slideHeight;
    const maxWidth = slideWidth * maxWidthRatio;
    const maxHeight = slideHeight * maxHeightRatio;

    // First, measure without wrapping to get natural width
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    tempDiv.style.cssText = `
      visibility: hidden;
      top: -9999px;
    `;

    // Apply nowrap to all child elements to prevent any wrapping
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach((el) => {
      (el as HTMLElement).style.whiteSpace = 'nowrap';
    });

    document.body.appendChild(tempDiv);

    const naturalWidth = tempDiv.offsetWidth;
    const naturalHeight = tempDiv.offsetHeight;

    document.body.removeChild(tempDiv);

    // Only apply wrapping if natural width exceeds max width
    if (naturalWidth > maxWidth - padding * 2) {
      const wrappedDiv = document.createElement('div');
      wrappedDiv.innerHTML = content;
      wrappedDiv.style.cssText = `
        visibility: hidden;
        width: ${maxWidth - padding * 2}px;
        top: -9999px;
      `;

      const allWrappedElements = wrappedDiv.querySelectorAll('*');
      allWrappedElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.whiteSpace = 'normal';
        htmlEl.style.overflowWrap = 'break-word';
      });

      document.body.appendChild(wrappedDiv);

      const wrappedWidth = wrappedDiv.offsetWidth;
      const wrappedHeight = Math.min(wrappedDiv.offsetHeight, maxHeight - padding * 2);

      document.body.removeChild(wrappedDiv);

      return {
        width: wrappedWidth + padding,
        height: wrappedHeight + padding,
      };
    } else {
      return {
        width: naturalWidth + padding,
        height: naturalHeight + padding,
      };
    }
  }

  /**
   * Calculate text dimensions within a specific available block (not slide-based ratios)
   * This ensures text utilizes the actual available space instead of hardcoded percentages
   * @param content HTML content to measure
   * @param availableBlock The actual available block for the content
   * @param options Configuration for width utilization and padding
   * @returns Dimensions that properly utilize the available block space
   */
  calculateTextDimensionsForBlock(
    content: string,
    availableBlock: LayoutBlock,
    options: { widthUtilization?: number } = {}
  ): Size {
    const { widthUtilization = 0.9 } = options;
    const PADDING = 15;

    // Use actual available block width, not slide-based ratios
    const maxWidth = availableBlock.width * widthUtilization;
    const maxHeight = availableBlock.height;

    // First, measure natural width
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    tempDiv.style.cssText = `
      visibility: hidden;
      position: absolute;
      top: -9999px;
      white-space: nowrap;
    `;

    document.body.appendChild(tempDiv);
    const naturalWidth = tempDiv.offsetWidth;
    const naturalHeight = tempDiv.offsetHeight;
    document.body.removeChild(tempDiv);

    // If natural width is less than our target width, expand to fill available space
    if (naturalWidth < maxWidth - PADDING * 2) {
      // Force text to expand to utilize available width
      const expandedDiv = document.createElement('div');
      expandedDiv.innerHTML = content;
      expandedDiv.style.cssText = `
        visibility: hidden;
        position: absolute;
        top: -9999px;
        width: ${maxWidth - PADDING * 2}px;
        white-space: normal;
        overflow-wrap: break-word;
      `;

      document.body.appendChild(expandedDiv);
      const expandedHeight = Math.min(expandedDiv.offsetHeight, maxHeight - PADDING * 2);
      document.body.removeChild(expandedDiv);

      return {
        width: maxWidth,
        height: expandedHeight + PADDING,
      };
    }
    // If natural width exceeds available width, apply wrapping
    else if (naturalWidth > maxWidth - PADDING * 2) {
      const wrappedDiv = document.createElement('div');
      wrappedDiv.innerHTML = content;
      wrappedDiv.style.cssText = `
        visibility: hidden;
        position: absolute;
        top: -9999px;
        width: ${maxWidth - PADDING * 2}px;
        white-space: normal;
        overflow-wrap: break-word;
      `;

      document.body.appendChild(wrappedDiv);
      const wrappedHeight = Math.min(wrappedDiv.offsetHeight, maxHeight - PADDING * 2);
      document.body.removeChild(wrappedDiv);

      return {
        width: maxWidth,
        height: wrappedHeight + PADDING,
      };
    }
    // Natural width fits perfectly, but still expand to utilize available space
    else {
      return {
        width: maxWidth,
        height: naturalHeight + PADDING,
      };
    }
  }

  // Convenience methods with preset options
  calculateTitleDimensions(content: string): Size {
    return this.calculateTextDimensions(content, { maxWidthRatio: 0.9 });
  }

  calculateImageDimensions(): Size {
    // Use 40% of slide width for image width
    const imageWidth = this.slideWidth * 0.4;

    // Maintain aspect ratio (3:2 for landscape images)
    const imageHeight = imageWidth * (2 / 3);

    // Ensure image doesn't exceed 60% of slide height
    const maxImageHeight = this.slideHeight * 0.6;

    if (imageHeight > maxImageHeight) {
      const adjustedHeight = maxImageHeight;
      const adjustedWidth = adjustedHeight * (3 / 2);
      return {
        width: adjustedWidth,
        height: adjustedHeight,
      };
    }

    return {
      width: imageWidth,
      height: imageHeight,
    };
  }

  getHorizontallyCenterPosition(elementWidth: number): number {
    return (this.slideWidth - elementWidth) / 2;
  }

  getVerticallyCenterPosition(elementHeight: number): number {
    return (this.slideHeight - elementHeight) / 2;
  }

  getColumnCenterPosition(
    elementHeight: number,
    elementWidth: number,
    columnIndex: number,
    totalColumns: number = 2
  ): Position {
    const TOP_PADDING = 10;
    const columnWidth = this.slideWidth / totalColumns;
    const columnCenterX = columnIndex * columnWidth + columnWidth / 2;

    return {
      top: this.getVerticallyCenterPosition(elementHeight) + TOP_PADDING,
      left: columnCenterX - elementWidth / 2,
    };
  }

  /**
   * Layouts items within any available block with configurable options
   * Replaces getItemPositionsWithCustomSpacing with more flexible approach
   */
  layoutItemsInBlock(
    itemDimensions: Size[],
    availableBlock: LayoutBlock,
    spacing: number,
    options: { alignment?: 'top' | 'center'; leftMargin?: number } = {}
  ): ElementBounds[] {
    const { alignment = 'center', leftMargin = 0 } = options;

    const totalItemsHeight = itemDimensions.reduce((sum, dim) => sum + dim.height, 0);
    const totalSpacingHeight = (itemDimensions.length - 1) * spacing;
    const totalNeededHeight = totalItemsHeight + totalSpacingHeight;

    let startY = availableBlock.top;

    // Apply alignment
    if (alignment === 'center' && totalNeededHeight < availableBlock.height) {
      const extraSpace = availableBlock.height - totalNeededHeight;
      const maxCenterOffset = Math.min(extraSpace / 2, 80);
      startY = availableBlock.top + maxCenterOffset;
    }

    // Calculate cumulative positions
    const positions: ItemPosition[] = [];
    let currentY = startY;

    for (let i = 0; i < itemDimensions.length; i++) {
      positions.push({
        top: currentY,
        left: availableBlock.left + leftMargin,
        width: itemDimensions[i].width,
        height: itemDimensions[i].height,
      });

      // Move to next position
      currentY += itemDimensions[i].height + spacing;
    }

    return positions;
  }

  /**
   * Creates flexible column layout with percentage-based widths
   * @param columnWidths Array of percentages (e.g., [20, 20, 60] for 20%, 20%, 60%)
   * @returns Array of LayoutBlock objects for each column
   */
  getColumnsLayout(columnWidths: number[]): LayoutBlock[] {
    // Validate percentages add up to 100
    const totalPercentage = columnWidths.reduce((sum, width) => sum + width, 0);
    if (Math.abs(totalPercentage - 100) > 0.1) {
      console.warn(`Column widths should add up to 100%, got ${totalPercentage}%`);
    }

    const columns: LayoutBlock[] = [];
    let currentLeft = 0;

    columnWidths.forEach((widthPercentage) => {
      const columnWidth = (this.slideWidth * widthPercentage) / 100;

      columns.push({
        left: currentLeft,
        top: 0,
        width: columnWidth,
        height: this.slideHeight,
      });

      // Move to next column position
      currentLeft += columnWidth;
    });

    return columns;
  }

  /**
   * Calculates available height with top and bottom margins
   * @param topMargin Top margin in pixels
   * @param bottomMargin Bottom margin in pixels
   * @returns Available height for content
   */
  calculateAvailableHeight(topMargin: number = 0, bottomMargin: number = 0): number {
    return this.slideHeight - topMargin - bottomMargin;
  }

  // =============================================
  // DEPRECATED METHODS - KEPT FOR COMPATIBILITY
  // =============================================

  /**
   * @deprecated Use getColumnsLayout instead for flexible percentage-based columns
   *
   * Migration example:
   * OLD: getColumnAvailableBlock(1, 2, 100, 40)
   * NEW: const columns = getColumnsLayout([50, 50]);
   *      const block = { ...columns[1], height: calculateAvailableHeight(100, 40) };
   */
  getColumnAvailableBlock(
    columnIndex: number,
    totalColumns: number = 2,
    topMargin: number = 0,
    bottomMargin: number = 0
  ): LayoutBlock {
    const LEFT_PADDING = 20;
    const TOP_PADDING = 10;
    const columnWidth = this.slideWidth / totalColumns;

    return {
      top: TOP_PADDING + topMargin,
      left: LEFT_PADDING + columnIndex * columnWidth,
      width: columnWidth - LEFT_PADDING,
      height: this.slideHeight - topMargin - bottomMargin,
    };
  }

  /**
   * @deprecated
   * Calculates item position in auto-layout with overflow handling
   */
  getItemPositionInAutoLayout(
    elementHeight: number,
    elementWidth: number,
    index: number,
    totalItems: number,
    columnIndex: number,
    totalColumns: number = 2
  ): ItemPosition {
    const availableBlock = this.getColumnAvailableBlock(columnIndex, totalColumns, 100, 40);
    const minSpacing = 5; // Reduced minimum spacing
    const maxSpacing = 60;

    const availableHeight = availableBlock.height;

    const totalItemsHeight = totalItems * elementHeight;
    const totalSpacingHeight = (totalItems - 1) * minSpacing;
    const totalNeededHeight = totalItemsHeight + totalSpacingHeight;

    let actualSpacing = minSpacing;
    let startY = availableBlock.top;

    // Handle overflow: if content doesn't fit, reduce spacing and compress
    if (totalNeededHeight > availableHeight) {
      // Calculate maximum possible spacing
      const maxPossibleSpacing = Math.max(
        0,
        (availableHeight - totalItemsHeight) / Math.max(1, totalItems - 1)
      );
      actualSpacing = Math.max(2, maxPossibleSpacing); // Minimum 2px spacing

      // If still doesn't fit, we'll let items overflow (better than overlapping)
      if (totalItemsHeight + (totalItems - 1) * actualSpacing > availableHeight) {
        actualSpacing = 2; // Very tight spacing
      }
    } else {
      // Center items if there's extra space
      const extraSpace = availableHeight - totalNeededHeight;

      if (totalItems > 1) {
        const potentialSpacing = minSpacing + extraSpace / (totalItems - 1);
        actualSpacing = Math.min(potentialSpacing, maxSpacing);

        if (actualSpacing < potentialSpacing) {
          const usedSpacing = (totalItems - 1) * actualSpacing;
          const usedHeight = totalItemsHeight + usedSpacing;
          const remainingSpace = availableHeight - usedHeight;
          startY = availableBlock.top + remainingSpace / 2;
        }
      } else {
        const maxCenterOffset = 60;
        const centerOffset = Math.min(extraSpace / 2, maxCenterOffset);
        startY = availableBlock.top + centerOffset;
      }
    }

    const y = startY + index * (elementHeight + actualSpacing);

    return {
      top: y,
      left: availableBlock.left,
      width: elementWidth,
      height: elementHeight,
    };
  }

  /**
   * @deprecated Use layoutItemsInBlock instead for more flexibility
   * Calculates positions for items with variable heights and custom spacing
   * This method considers the actual height of each item and uses provided spacing
   */
  getItemPositionsWithCustomSpacing(
    itemDimensions: { width: number; height: number }[],
    columnIndex: number,
    customSpacing: number,
    totalColumns: number = 2
  ): ItemPosition[] {
    const availableBlock = this.getColumnAvailableBlock(columnIndex, totalColumns, 100, 40);

    const totalItemsHeight = itemDimensions.reduce((sum, dim) => sum + dim.height, 0);
    const totalSpacingHeight = (itemDimensions.length - 1) * customSpacing;
    const totalNeededHeight = totalItemsHeight + totalSpacingHeight;

    let startY = availableBlock.top;

    // Center the content group if there's extra space
    if (totalNeededHeight < availableBlock.height) {
      const extraSpace = availableBlock.height - totalNeededHeight;
      const maxCenterOffset = Math.min(extraSpace / 2, 80); // More generous centering
      startY = availableBlock.top + maxCenterOffset;
    }

    // Calculate cumulative positions with custom spacing
    const positions: ItemPosition[] = [];
    let currentY = startY;

    for (let i = 0; i < itemDimensions.length; i++) {
      positions.push({
        top: currentY,
        left: availableBlock.left,
        width: itemDimensions[i].width,
        height: itemDimensions[i].height,
      });

      // Move to next position (current height + custom spacing)
      currentY += itemDimensions[i].height + customSpacing;
    }

    return positions;
  }

  /**
   * @deprecated Use layoutItemsInBlock instead
   * Calculates positions for items with variable heights in auto-layout
   * This method considers the actual height of each item to prevent overlapping
   */
  getItemPositionsWithVariableHeights(
    itemDimensions: { width: number; height: number }[],
    columnIndex: number,
    totalColumns: number = 2
  ): ItemPosition[] {
    const availableBlock = this.getColumnAvailableBlock(columnIndex, totalColumns, 100, 40);
    const minSpacing = 5;
    const maxSpacing = 30;

    const totalItemsHeight = itemDimensions.reduce((sum, dim) => sum + dim.height, 0);
    const totalSpacingHeight = (itemDimensions.length - 1) * minSpacing;
    const totalNeededHeight = totalItemsHeight + totalSpacingHeight;

    let actualSpacing = minSpacing;
    let startY = availableBlock.top;

    // Handle overflow: if content doesn't fit, reduce spacing
    if (totalNeededHeight > availableBlock.height) {
      const maxPossibleSpacing = Math.max(
        0,
        (availableBlock.height - totalItemsHeight) / Math.max(1, itemDimensions.length - 1)
      );
      actualSpacing = Math.max(2, maxPossibleSpacing);
    } else {
      // Center items if there's extra space
      const extraSpace = availableBlock.height - totalNeededHeight;

      if (itemDimensions.length > 1) {
        const potentialSpacing = minSpacing + extraSpace / (itemDimensions.length - 1);
        actualSpacing = Math.min(potentialSpacing, maxSpacing);

        // If we're not using all the potential spacing, center the content
        if (actualSpacing < potentialSpacing) {
          const usedSpacing = (itemDimensions.length - 1) * actualSpacing;
          const usedHeight = totalItemsHeight + usedSpacing;
          const remainingSpace = availableBlock.height - usedHeight;
          startY = availableBlock.top + remainingSpace / 2;
        }
      } else {
        // Single item - center it vertically
        const centerOffset = Math.min(extraSpace / 2, 60);
        startY = availableBlock.top + centerOffset;
      }
    }

    // Calculate cumulative positions
    const positions: ItemPosition[] = [];
    let currentY = startY;

    for (let i = 0; i < itemDimensions.length; i++) {
      positions.push({
        top: currentY,
        left: availableBlock.left,
        width: itemDimensions[i].width,
        height: itemDimensions[i].height,
      });

      // Move to next position (current height + spacing)
      currentY += itemDimensions[i].height + actualSpacing;
    }

    return positions;
  }
}
