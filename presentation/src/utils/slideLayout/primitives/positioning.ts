import type {
  Bounds,
  Position,
  Size,
  LayoutBlockInstance,
  TextLayoutBlockInstance,
  DistributionType,
  RelativePositioning,
  SlideViewport,
  ChildLayoutConfig,
  BoundsExpression,
} from '../types';
import { DEFAULT_SPACING_BETWEEN_ITEMS } from './layoutConstants';
import { resolveTemplateBounds } from './expressionResolver';
import { measureElement } from './elementMeasurement';

/**
 * Calculate parent bounds that would fit all children with the given layout configuration
 * Non-recursive - only calculates for immediate children
 */
export function calculateParentBoundsFromChildren(
  childrenBounds: Bounds[],
  layoutConfig?: ChildLayoutConfig
): Bounds {
  if (childrenBounds.length === 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  const orientation = layoutConfig?.orientation || 'vertical';
  const gap = layoutConfig?.gap || 0;

  // Find the bounding box that contains all children
  let minLeft = Infinity;
  let minTop = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;

  childrenBounds.forEach((child) => {
    minLeft = Math.min(minLeft, child.left);
    minTop = Math.min(minTop, child.top);
    maxRight = Math.max(maxRight, child.left + child.width);
    maxBottom = Math.max(maxBottom, child.top + child.height);
  });

  // Calculate dimensions based on orientation and spacing
  let width: number;
  let height: number;

  if (orientation === 'horizontal') {
    // Horizontal: width = sum of widths + spacing, height = max height
    const totalItemWidth = childrenBounds.reduce((sum, child) => sum + child.width, 0);
    const totalSpacing = (childrenBounds.length - 1) * gap;
    width = totalItemWidth + totalSpacing;

    const maxChildHeight = Math.max(...childrenBounds.map((child) => child.height));
    height = maxChildHeight;
  } else {
    // Vertical: height = sum of heights + spacing, width = max width
    const totalItemHeight = childrenBounds.reduce((sum, child) => sum + child.height, 0);
    const totalSpacing = (childrenBounds.length - 1) * gap;
    height = totalItemHeight + totalSpacing;

    const maxChildWidth = Math.max(...childrenBounds.map((child) => child.width));
    width = maxChildWidth;
  }

  // Use the minimum left/top from children
  const left = minLeft;
  const top = minTop;

  return {
    left,
    top,
    width,
    height,
  };
}

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

  const totalItemsHeight = itemDimensions.reduce((sum, dim) => sum + dim.height, 0);
  const availableHeight = container.bounds.height;
  const availableWidth = container.bounds.width;

  let positions: Bounds[] = [];
  let startY = container.bounds.top;

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

  switch (distribution) {
    case 'space-between': {
      // Space between: distribute extra space evenly between items
      if (itemDimensions.length === 1) {
        // Single item: center it vertically
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
      break;
    }

    case 'space-around': {
      // Space around: distribute space evenly around items
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
      break;
    }

    case 'equal':
    default: {
      // Equal: use fixed spacing defined by spacingBetweenItems
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
      break;
    }
  }

  return positions;
}

/**
 * Measure elements and apply final positioning
 */
export function measureAndPositionElements(
  instance: LayoutBlockInstance,
  labelGroups: Map<string, TextLayoutBlockInstance[]>,
  allElements: Record<string, HTMLElement[]>,
  dataMap: Map<string, any[]>
): void {
  // For each parent with labeled children, measure and position
  if (!instance.children) return;

  instance.children.forEach((child) => {
    if (!child.children || child.children.length === 0) {
      // Recurse for nested structures
      measureAndPositionElements(child, labelGroups, allElements, dataMap);
      return;
    }

    // Find all labeled children
    const labeledChildren = child.children.filter((c) => c.label);
    if (labeledChildren.length === 0) return;

    // Measure dimensions for each labeled child
    const dimensions = labeledChildren.map((labeledChild, idx) => {
      const label = labeledChild.label!;
      const elements = allElements[label];
      if (!elements) return { width: child.bounds.width, height: 20 };

      // Find which element index this is
      const instances = labelGroups.get(label) || [];
      const elementIndex = instances.indexOf(labeledChild as TextLayoutBlockInstance);
      if (elementIndex === -1 || !elements[elementIndex]) {
        return { width: child.bounds.width, height: 20 };
      }

      const measured = measureElement(elements[elementIndex], {
        maxWidth: child.bounds.width,
      });

      return { width: child.bounds.width, height: measured.height };
    });

    // Position using layoutItemsInBlock
    const positionedBounds = layoutItemsInBlock(dimensions, child);

    // Apply positioned bounds
    labeledChildren.forEach((labeledChild, idx) => {
      labeledChild.bounds = positionedBounds[idx];
    });
  });
}

/**
 * Recursively preprocess descendants to calculate bounds
 */
export function recursivelyPreprocessDescendants(container: LayoutBlockInstance): void {
  if (!container.children || container.children.length === 0) return;

  const items = getChildrenMaxBounds(container.bounds, {
    distribution: container.layout?.distribution,
    childCount: container.children.length,
    orientation: container.layout?.orientation,
  });

  container.children.forEach((child, index) => {
    if (!items[index]) return;

    container.children![index] = { ...child, bounds: items[index] } as TextLayoutBlockInstance;

    if (child.children && child.children.length > 0) {
      recursivelyPreprocessDescendants(container.children![index]);
    }
  });
}

/**
 * Recursively get all label instances
 */
export function recursivelyGetAllLabelInstances(
  container: LayoutBlockInstance,
  label: string
): LayoutBlockInstance[] {
  let labels: LayoutBlockInstance[] = [];

  if (!container.children || container.children.length === 0) return labels;

  for (const child of container.children) {
    if (child.label === label) {
      labels.push(child);
    }

    if (child.children && child.children.length > 0) {
      labels = labels.concat(recursivelyGetAllLabelInstances(child, label));
    }
  }

  return labels;
}

export function getColumnsLayout(columnWidths: number[]): Bounds[] {
  // Validate percentages add up to 100
  const totalPercentage = columnWidths.reduce((sum, width) => sum + width, 0);
  if (Math.abs(totalPercentage - 100) > 0.1) {
    console.warn(`Column widths should add up to 100%, got ${totalPercentage}%`);
  }

  const columns: Bounds[] = [];
  let currentLeft = 0;

  columnWidths.forEach((widthPercentage) => {
    const columnWidth = (1000 * widthPercentage) / 100; // Assuming slide width of 1000

    columns.push({
      left: currentLeft,
      top: 0,
      width: columnWidth,
      height: 562.5, // Assuming slide height
    });

    // Move to next column position
    currentLeft += columnWidth;
  });

  return columns;
}
