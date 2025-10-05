import type {
  Bounds,
  Position,
  Size,
  LayoutBlockInstance,
  TextLayoutBlockInstance,
  DistributionType,
  RelativePositioning,
  SlideViewport,
} from '../types';
import { measureElement } from '../elementMeasurement';
import { DEFAULT_SPACING_BETWEEN_ITEMS } from './layoutConstants';

/**
 * Get position within container bounds
 */
export function getPosition(
  containerBounds: Bounds,
  itemDimensions: Size,
  options: {
    horizontalAlignment?: 'left' | 'center' | 'right';
    verticalAlignment?: 'top' | 'center' | 'bottom';
  }
): Position {
  let left = containerBounds.left;
  let top = containerBounds.top;

  // Apply horizontal alignment
  if (options.horizontalAlignment === 'center') {
    left = containerBounds.left + (containerBounds.width - itemDimensions.width) / 2;
  } else if (options.horizontalAlignment === 'right') {
    left = containerBounds.left + containerBounds.width - itemDimensions.width;
  }

  // Apply vertical alignment
  if (options.verticalAlignment === 'center') {
    top = containerBounds.top + (containerBounds.height - itemDimensions.height) / 2;
  } else if (options.verticalAlignment === 'bottom') {
    top = containerBounds.top + containerBounds.height - itemDimensions.height;
  }

  return { left, top };
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
    spacingBetweenItems?: number;
  }
): Bounds[] {
  const {
    distribution = '50/50',
    childCount = 0,
    orientation = 'vertical',
    spacingBetweenItems = DEFAULT_SPACING_BETWEEN_ITEMS,
  } = options || {};

  if (childCount === 0) {
    return [];
  }

  const positions: Bounds[] = [];

  // Calculate base item dimensions assuming equal distribution
  const totalSpacing = spacingBetweenItems * (childCount - 1);
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
            left: bounds.left + i * (itemSize + spacingBetweenItems),
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
          left: bounds.left + i * (itemSize + spacingBetweenItems),
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
            top: bounds.top + i * (itemSize + spacingBetweenItems),
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
          top: bounds.top + i * (itemSize + spacingBetweenItems),
          width: bounds.width,
          height: itemSize,
        });
      }
    }
  }

  return positions;
}

/**
 * Layout items within a block container
 */
export function layoutItemsInBlock(itemDimensions: Size[], container: LayoutBlockInstance): Bounds[] {
  const distribution = container.distribution || 'equal';
  const alignment = container.verticalAlignment || 'top';

  const totalItemsHeight = itemDimensions.reduce((sum, dim) => sum + dim.height, 0);
  const availableHeight =
    container.bounds.height - (container.padding.top || 0) - (container.padding.bottom || 0);

  let positions: Bounds[] = [];
  let startY = container.bounds.top + (container.padding.top || 0);

  switch (distribution) {
    case 'space-between': {
      // Space between: distribute extra space evenly between items
      if (itemDimensions.length === 1) {
        // Single item: center it
        const centerY = startY + (availableHeight - itemDimensions[0].height) / 2;
        positions = [
          {
            top: centerY,
            left: container.bounds.left + (container.padding.left || 0),
            width: itemDimensions[0].width,
            height: itemDimensions[0].height,
          },
        ];
      } else {
        const extraSpace = availableHeight - totalItemsHeight;
        const spaceBetween = extraSpace / (itemDimensions.length - 1);
        let currentY = startY;

        positions = itemDimensions.map((dim, index) => {
          const position = {
            top: currentY,
            left: container.bounds.left + (container.padding.left || 0),
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
          left: container.bounds.left + (container.padding.left || 0),
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
      const actualSpacing = container.spacingBetweenItems || DEFAULT_SPACING_BETWEEN_ITEMS;
      const totalNeededHeight = totalItemsHeight + (itemDimensions.length - 1) * actualSpacing;

      // Apply vertical alignment
      if (alignment === 'center' && totalNeededHeight < availableHeight) {
        const extraSpace = availableHeight - totalNeededHeight;
        startY += Math.min(extraSpace / 2, 80); // Max center offset of 80px
      } else if (alignment === 'bottom' && totalNeededHeight < availableHeight) {
        startY += availableHeight - totalNeededHeight;
      }

      let currentY = startY;
      positions = itemDimensions.map((dim) => {
        const position = {
          top: currentY,
          left: container.bounds.left + (container.padding.left || 0),
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
    distribution: container.distribution,
    childCount: container.children.length,
    orientation: container.orientation,
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
): TextLayoutBlockInstance[] {
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

/**
 * Resolve container positions with priority:
 * 1. If bounds exists, use it (absolute positioning)
 * 2. Otherwise use positioning (relative positioning)
 */
export function resolveContainerPositions(
  containers: Record<string, { bounds?: Bounds; positioning?: RelativePositioning }>,
  viewport: SlideViewport
): Record<string, Bounds> {
  const resolved: Record<string, Bounds> = {};
  const pending = new Set(Object.keys(containers));

  // Process containers in dependency order
  while (pending.size > 0) {
    let madeProgress = false;

    for (const id of pending) {
      const container = containers[id];

      // PRIORITY 1: Use absolute bounds if specified
      if (container.bounds) {
        resolved[id] = container.bounds;
        pending.delete(id);
        madeProgress = true;
        continue;
      }

      // PRIORITY 2: Use relative positioning
      if (container.positioning) {
        const pos = container.positioning;
        const parentId = pos.relativeTo;

        // No parent = relative to viewport
        if (!parentId) {
          resolved[id] = calculateBoundsFromPositioning(
            pos,
            { left: 0, top: 0, width: viewport.width, height: viewport.height },
            viewport
          );
          pending.delete(id);
          madeProgress = true;
          continue;
        }

        // Parent is resolved - calculate relative position
        if (resolved[parentId]) {
          resolved[id] = calculateBoundsFromPositioning(pos, resolved[parentId], viewport);
          pending.delete(id);
          madeProgress = true;
        }
      } else {
        // Neither bounds nor positioning specified
        throw new Error(`Container '${id}' must have either bounds or positioning`);
      }
    }

    if (!madeProgress) {
      throw new Error('Circular dependency in container positioning');
    }
  }

  return resolved;
}

/**
 * Calculate bounds from relative positioning
 */
export function calculateBoundsFromPositioning(
  positioning: RelativePositioning,
  parentBounds: Bounds,
  viewport: SlideViewport
): Bounds {
  // Start with parent bounds (non-positioned axis inherits from parent)
  let left = parentBounds.left;
  let top = parentBounds.top;
  let width = parentBounds.width;
  let height = parentBounds.height;

  const anchor = positioning.anchor || 'start';
  const offset = positioning.offset || 0;
  const size = positioning.size;
  const margin = positioning.margin || {};

  if (positioning.axis === 'horizontal') {
    // === HORIZONTAL POSITIONING (modify left and width only) ===

    // Calculate starting position based on anchor
    if (anchor === 'start') {
      // Anchor to left edge of parent
      left = parentBounds.left + offset + (margin.left || 0);
    } else if (anchor === 'end') {
      // Anchor to right edge of parent
      left = parentBounds.left + parentBounds.width + offset + (margin.left || 0);
    } else if (anchor === 'center') {
      // Anchor to center of parent
      left = parentBounds.left + parentBounds.width / 2 + offset + (margin.left || 0);
    }

    // Calculate width based on size
    if (size === 'fill') {
      // Fill remaining width to viewport right edge, accounting for right margin
      width = viewport.width - left - (margin.right || 0);
    } else if (typeof size === 'number') {
      // Explicit width
      width = size;
    }
    // else: keep parent width

    // Top and height are inherited from parent, but apply vertical margins
    top = parentBounds.top + (margin.top || 0);
    height = parentBounds.height - (margin.top || 0) - (margin.bottom || 0);
  } else {
    // === VERTICAL POSITIONING (modify top and height only) ===

    // Calculate starting position based on anchor
    if (anchor === 'start') {
      // Anchor to top edge of parent
      top = parentBounds.top + offset + (margin.top || 0);
    } else if (anchor === 'end') {
      // Anchor to bottom edge of parent
      top = parentBounds.top + parentBounds.height + offset + (margin.top || 0);
    } else if (anchor === 'center') {
      // Anchor to center of parent
      top = parentBounds.top + parentBounds.height / 2 + offset + (margin.top || 0);
    }

    // Calculate height based on size
    if (size === 'fill') {
      // Fill remaining height to viewport bottom edge, accounting for bottom margin
      height = viewport.height - top - (margin.bottom || 0);
    } else if (typeof size === 'number') {
      // Explicit height
      height = size;
    }
    // else: keep parent height

    // Left and width are inherited from parent, but apply horizontal margins
    left = parentBounds.left + (margin.left || 0);
    width = parentBounds.width - (margin.left || 0) - (margin.right || 0);
  }

  return { left, top, width, height };
}
