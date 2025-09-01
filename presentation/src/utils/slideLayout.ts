export interface TextDimensions {
  width: number;
  height: number;
}

export interface SlideViewport {
  size: number;
  ratio: number;
}

export interface Position {
  top: number;
  left: number;
}

export interface AvailableBlock extends Position {
  width: number;
  height: number;
}

export interface ItemPosition extends AvailableBlock {}

export interface TextCalculationOptions {
  maxWidthRatio?: number;
  maxHeightRatio?: number;
  padding?: number;
}

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
  calculateTextDimensions(content: string, options?: TextCalculationOptions): TextDimensions {
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

  // Convenience methods with preset options
  calculateTitleDimensions(content: string): TextDimensions {
    return this.calculateTextDimensions(content, { maxWidthRatio: 0.9 });
  }

  calculateImageDimensions(): TextDimensions {
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

  getColumnAvailableBlock(
    columnIndex: number,
    totalColumns: number = 2,
    topMargin: number = 0,
    bottomMargin: number = 0
  ): AvailableBlock {
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
   *
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
    const minSpacing = 10;
    const maxSpacing = 60;

    const availableHeight = availableBlock.height;

    const totalItemsHeight = totalItems * elementHeight;
    const totalSpacingHeight = (totalItems - 1) * minSpacing;
    const totalNeededHeight = totalItemsHeight + totalSpacingHeight;

    let actualSpacing = minSpacing;
    let startY = availableBlock.top;

    // Center items if there's extra space
    if (totalNeededHeight < availableHeight) {
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
}
