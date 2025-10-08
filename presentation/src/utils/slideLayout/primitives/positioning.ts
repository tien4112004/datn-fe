import type { Bounds, Size, LayoutBlockInstance, TextLayoutBlockInstance, DistributionType } from '../types';
import { DEFAULT_SPACING_BETWEEN_ITEMS } from './layoutConstants';
import { measureElement } from './elementMeasurement';

/**
 * Calculate bounds for child elements within a parent container
 */
export function getChildrenMaxBounds(
  bounds: Bounds,
  options?: {
    distribution?: DistributionType;
    childCount?: number;
    orientation?: 'horizontal' | 'vertical';
    gap?: number;
  }
): Bounds[] {
  const {
    distribution = '50/50',
    childCount = 0,
    orientation = 'vertical',
    gap = DEFAULT_SPACING_BETWEEN_ITEMS,
  } = options || {};

  if (childCount === 0) {
    return [];
  }

  const positions: Bounds[] = [];

  // Calculate base item dimensions assuming equal distribution
  const totalSpacing = gap * (childCount - 1);
  const availableSpace =
    orientation === 'horizontal' ? bounds.width - totalSpacing : bounds.height - totalSpacing;
  const itemSize = availableSpace / childCount;

  if (orientation === 'horizontal') {
    if (distribution === 'space-between' && childCount > 1) {
      // Space between: distribute remaining space evenly between items
      const totalItemWidth = childCount * itemSize;
      const remainingSpace = bounds.width - totalItemWidth;
      const spacing = remainingSpace / (childCount - 1);

      for (let i = 0; i < childCount; i++) {
        positions.push({
          left: bounds.left + i * (itemSize + spacing),
          top: bounds.top,
          width: itemSize,
          height: bounds.height,
        });
      }
    } else if (distribution === 'space-around' && childCount > 1) {
      // Space around: distribute remaining space evenly around items
      const totalItemWidth = childCount * itemSize;
      const remainingSpace = bounds.width - totalItemWidth;
      const spacing = remainingSpace / (childCount + 1);

      for (let i = 0; i < childCount; i++) {
        positions.push({
          left: bounds.left + spacing + i * (itemSize + spacing),
          top: bounds.top,
          width: itemSize,
          height: bounds.height,
        });
      }
    } else if (distribution.includes('/')) {
      // Handle ratio distribution like '30/70'
      const parts = distribution.split('/');
      if (parts.length === childCount && parts.every((p) => !isNaN(Number(p)))) {
        const ratios = parts.map(Number);
        const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
        const widths = ratios.map((r) => (bounds.width * r) / totalRatio);

        let currentLeft = bounds.left;
        for (let i = 0; i < childCount; i++) {
          positions.push({
            left: currentLeft,
            top: bounds.top,
            width: widths[i],
            height: bounds.height,
          });
          currentLeft += widths[i];
        }
      } else {
        // Fallback to equal distribution
        for (let i = 0; i < childCount; i++) {
          positions.push({
            left: bounds.left + i * (itemSize + gap),
            top: bounds.top,
            width: itemSize,
            height: bounds.height,
          });
        }
      }
    } else {
      // Equal distribution (default)
      for (let i = 0; i < childCount; i++) {
        positions.push({
          left: bounds.left + i * (itemSize + gap),
          top: bounds.top,
          width: itemSize,
          height: bounds.height,
        });
      }
    }
  } else {
    // Vertical layout
    if (distribution === 'space-between' && childCount > 1) {
      const totalItemHeight = childCount * itemSize;
      const remainingSpace = bounds.height - totalItemHeight;
      const spacing = remainingSpace / (childCount - 1);

      for (let i = 0; i < childCount; i++) {
        positions.push({
          left: bounds.left,
          top: bounds.top + i * (itemSize + spacing),
          width: bounds.width,
          height: itemSize,
        });
      }
    } else if (distribution === 'space-around' && childCount > 1) {
      const totalItemHeight = childCount * itemSize;
      const remainingSpace = bounds.height - totalItemHeight;
      const spacing = remainingSpace / (childCount + 1);

      for (let i = 0; i < childCount; i++) {
        positions.push({
          left: bounds.left,
          top: bounds.top + spacing + i * (itemSize + spacing),
          width: bounds.width,
          height: itemSize,
        });
      }
    } else if (distribution.includes('/')) {
      // Handle ratio distribution
      const parts = distribution.split('/');
      if (parts.length === childCount && parts.every((p) => !isNaN(Number(p)))) {
        const ratios = parts.map(Number);
        const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
        const heights = ratios.map((r) => (bounds.height * r) / totalRatio);

        let currentTop = bounds.top;
        for (let i = 0; i < childCount; i++) {
          positions.push({
            left: bounds.left,
            top: currentTop,
            width: bounds.width,
            height: heights[i],
          });
          currentTop += heights[i];
        }
      } else {
        // Fallback to equal distribution
        for (let i = 0; i < childCount; i++) {
          positions.push({
            left: bounds.left,
            top: bounds.top + i * (itemSize + gap),
            width: bounds.width,
            height: itemSize,
          });
        }
      }
    } else {
      // Equal distribution (default)
      for (let i = 0; i < childCount; i++) {
        positions.push({
          left: bounds.left,
          top: bounds.top + i * (itemSize + gap),
          width: bounds.width,
          height: itemSize,
        });
      }
    }
  }

  return positions;
}
export function layoutItemsInBlock(itemDimensions: Size[], container: LayoutBlockInstance): Bounds[] {
  const distribution = container.layout?.distribution || 'equal';
  const verticalAlignment = container.layout?.verticalAlignment || 'top';
  const horizontalAlignment = container.layout?.horizontalAlignment || 'left';
  const orientation = container.layout?.orientation || 'vertical';

  const totalItemsHeight = itemDimensions.reduce((sum, dim) => sum + dim.height, 0);
  const totalItemsWidth = itemDimensions.reduce((sum, dim) => sum + dim.width, 0);
  const availableHeight = container.bounds.height;
  const availableWidth = container.bounds.width;

  let positions: Bounds[] = [];
  let startY = container.bounds.top;
  let startX = container.bounds.left;

  // Helper function to calculate horizontal position based on alignment
  const getHorizontalPosition = (itemWidth: number): number => {
    const startX = container.bounds.left;

    switch (horizontalAlignment) {
      case 'center':
        return startX + (availableWidth - itemWidth) / 2;
      case 'right':
        return startX + availableWidth - itemWidth;
      case 'left':
      default:
        return startX;
    }
  };

  // Helper function to calculate vertical position based on alignment
  const getVerticalPosition = (itemHeight: number): number => {
    const startY = container.bounds.top;

    switch (verticalAlignment) {
      case 'center':
        return startY + (availableHeight - itemHeight) / 2;
      case 'bottom':
        return startY + availableHeight - itemHeight;
      case 'top':
      default:
        return startY;
    }
  };

  // Handle horizontal orientation
  if (orientation === 'horizontal') {
    // Check if distribution is a ratio pattern like '1/8'
    if (distribution.includes('/')) {
      const parts = distribution.split('/');
      if (parts.length === itemDimensions.length && parts.every((p) => !isNaN(Number(p)))) {
        const ratios = parts.map(Number);
        const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
        const actualSpacing = container.layout?.gap || 0;
        const totalSpacing = actualSpacing * (itemDimensions.length - 1);
        const availableWidthForItems = availableWidth - totalSpacing;

        let currentLeft = startX;
        positions = itemDimensions.map((dim, idx) => {
          const itemWidth = (availableWidthForItems * ratios[idx]) / totalRatio;
          const position = {
            left: currentLeft,
            top: getVerticalPosition(dim.height),
            width: itemWidth,
            height: dim.height,
          };
          currentLeft += itemWidth + actualSpacing;
          return position;
        });
      } else {
        // Fallback to equal distribution
        const actualSpacing = container.layout?.gap || DEFAULT_SPACING_BETWEEN_ITEMS;
        const totalSpacing = actualSpacing * (itemDimensions.length - 1);
        const itemWidth = (availableWidth - totalSpacing) / itemDimensions.length;

        let currentLeft = startX;
        positions = itemDimensions.map((dim) => {
          const position = {
            left: currentLeft,
            top: getVerticalPosition(dim.height),
            width: itemWidth,
            height: dim.height,
          };
          currentLeft += itemWidth + actualSpacing;
          return position;
        });
      }
    } else if (distribution === 'space-between') {
      if (itemDimensions.length === 1) {
        const centerX = startX + (availableWidth - itemDimensions[0].width) / 2;
        positions = [
          {
            left: centerX,
            top: getVerticalPosition(itemDimensions[0].height),
            width: itemDimensions[0].width,
            height: itemDimensions[0].height,
          },
        ];
      } else {
        const extraSpace = availableWidth - totalItemsWidth;
        const spaceBetween = extraSpace / (itemDimensions.length - 1);
        let currentX = startX;

        positions = itemDimensions.map((dim) => {
          const position = {
            left: currentX,
            top: getVerticalPosition(dim.height),
            width: dim.width,
            height: dim.height,
          };
          currentX += dim.width + spaceBetween;
          return position;
        });
      }
    } else if (distribution === 'space-around') {
      const extraSpace = availableWidth - totalItemsWidth;
      const spaceAroundEach = extraSpace / (itemDimensions.length + 1);
      let currentX = startX + spaceAroundEach;

      positions = itemDimensions.map((dim) => {
        const position = {
          left: currentX,
          top: getVerticalPosition(dim.height),
          width: dim.width,
          height: dim.height,
        };
        currentX += dim.width + spaceAroundEach;
        return position;
      });
    } else {
      // Equal: use fixed spacing
      const actualSpacing = container.layout?.gap || DEFAULT_SPACING_BETWEEN_ITEMS;
      const totalNeededWidth = totalItemsWidth + (itemDimensions.length - 1) * actualSpacing;

      // Apply horizontal alignment
      if (horizontalAlignment === 'center' && totalNeededWidth < availableWidth) {
        const extraSpace = availableWidth - totalNeededWidth;
        startX += extraSpace / 2;
      } else if (horizontalAlignment === 'right' && totalNeededWidth < availableWidth) {
        startX += availableWidth - totalNeededWidth;
      }

      let currentX = startX;
      positions = itemDimensions.map((dim) => {
        const position = {
          left: currentX,
          top: getVerticalPosition(dim.height),
          width: dim.width,
          height: dim.height,
        };
        currentX += dim.width + actualSpacing;
        return position;
      });
    }
  } else {
    // Vertical orientation
    // Check if distribution is a ratio pattern
    if (distribution.includes('/')) {
      const parts = distribution.split('/');
      if (parts.length === itemDimensions.length && parts.every((p) => !isNaN(Number(p)))) {
        const ratios = parts.map(Number);
        const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
        const actualSpacing = container.layout?.gap || 0;
        const totalSpacing = actualSpacing * (itemDimensions.length - 1);
        const availableHeightForItems = availableHeight - totalSpacing;

        let currentTop = startY;
        positions = itemDimensions.map((dim, idx) => {
          const itemHeight = (availableHeightForItems * ratios[idx]) / totalRatio;
          const position = {
            top: currentTop,
            left: getHorizontalPosition(dim.width),
            width: dim.width,
            height: itemHeight,
          };
          currentTop += itemHeight + actualSpacing;
          return position;
        });
      } else {
        // Fallback to equal distribution
        const actualSpacing = container.layout?.gap || DEFAULT_SPACING_BETWEEN_ITEMS;
        const totalSpacing = actualSpacing * (itemDimensions.length - 1);
        const itemHeight = (availableHeight - totalSpacing) / itemDimensions.length;

        let currentTop = startY;
        positions = itemDimensions.map((dim) => {
          const position = {
            top: currentTop,
            left: getHorizontalPosition(dim.width),
            width: dim.width,
            height: itemHeight,
          };
          currentTop += itemHeight + actualSpacing;
          return position;
        });
      }
    } else if (distribution === 'space-between') {
      if (itemDimensions.length === 1) {
        const centerY = startY + (availableHeight - itemDimensions[0].height) / 2;
        positions = [
          {
            top: centerY,
            left: getHorizontalPosition(itemDimensions[0].width),
            width: itemDimensions[0].width,
            height: itemDimensions[0].height,
          },
        ];
      } else {
        const extraSpace = availableHeight - totalItemsHeight;
        const spaceBetween = extraSpace / (itemDimensions.length - 1);
        let currentY = startY;

        positions = itemDimensions.map((dim) => {
          const position = {
            top: currentY,
            left: getHorizontalPosition(dim.width),
            width: dim.width,
            height: dim.height,
          };
          currentY += dim.height + spaceBetween;
          return position;
        });
      }
    } else if (distribution === 'space-around') {
      const extraSpace = availableHeight - totalItemsHeight;
      const spaceAroundEach = extraSpace / (itemDimensions.length + 1);
      let currentY = startY + spaceAroundEach;

      positions = itemDimensions.map((dim) => {
        const position = {
          top: currentY,
          left: getHorizontalPosition(dim.width),
          width: dim.width,
          height: dim.height,
        };
        currentY += dim.height + spaceAroundEach;
        return position;
      });
    } else {
      // Equal: use fixed spacing defined by gap
      const actualSpacing = container.layout?.gap || DEFAULT_SPACING_BETWEEN_ITEMS;
      const totalNeededHeight = totalItemsHeight + (itemDimensions.length - 1) * actualSpacing;

      // Apply vertical alignment
      if (verticalAlignment === 'center' && totalNeededHeight < availableHeight) {
        const extraSpace = availableHeight - totalNeededHeight;
        startY += Math.min(extraSpace / 2, 80); // Max center offset of 80px
      } else if (verticalAlignment === 'bottom' && totalNeededHeight < availableHeight) {
        startY += availableHeight - totalNeededHeight;
      }

      let currentY = startY;
      positions = itemDimensions.map((dim) => {
        const position = {
          top: currentY,
          left: getHorizontalPosition(dim.width),
          width: dim.width,
          height: dim.height,
        };
        currentY += dim.height + actualSpacing;
        return position;
      });
    }
  }

  return positions;
}
