import type { SlideTheme } from '@/types/slides';
import { measureElement, measureElementForBlock } from './elementMeasurement';

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

/**
 * Main class for slide layout calculations
 */
export class SlideLayoutCalculator {
  private viewportSize: number;
  private viewportRatio: number;
  private theme: SlideTheme;

  constructor(viewportSize: number, viewportRatio: number, theme: SlideTheme) {
    this.viewportSize = viewportSize;
    this.viewportRatio = viewportRatio;
    this.theme = theme;
  }

  get slideWidth(): number {
    return this.viewportSize;
  }

  get slideHeight(): number {
    return this.viewportSize * this.viewportRatio;
  }

  // New element-based measurement methods
  measureHTMLElement(element: HTMLElement, constraints?: { maxWidth?: number; maxHeight?: number }): Size {
    return measureElement(element, constraints);
  }

  measureHTMLElementForBlock(
    element: HTMLElement,
    availableBlock: LayoutBlock,
    widthUtilization: number = 0.9
  ): Size {
    return measureElementForBlock(element, availableBlock.width, availableBlock.height, widthUtilization);
  }

  // Dimension Calculation Functions

  // Convenience methods with preset options

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

  layoutItemInBlock(
    itemDimensions: Size,
    availableBlock: LayoutBlock,
    options: { alignment?: 'top' | 'center' } = {}
  ): ElementBounds {
    const { alignment = 'center' } = options;

    let top = availableBlock.top;
    let left = availableBlock.left;

    // Apply alignment
    if (alignment === 'center' && itemDimensions.height < availableBlock.height) {
      top = availableBlock.top + (availableBlock.height - itemDimensions.height) / 2;
      left = availableBlock.left + (availableBlock.width - itemDimensions.width) / 2;
    }

    return {
      top,
      left,
      width: itemDimensions.width,
      height: itemDimensions.height,
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
    const positions: Rectangle[] = [];
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
}
