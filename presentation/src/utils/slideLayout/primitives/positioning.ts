import type { Bounds, Size, LayoutBlockInstance, TextLayoutBlockInstance, DistributionType } from '../types';
import { DEFAULT_SPACING_BETWEEN_ITEMS } from './layoutConstants';
import { measureElement } from './elementMeasurement';

/**
 * Main layout function with unified axis-based calculation
 */
export function layoutItemsInBlock(itemDimensions: Size[], container: LayoutBlockInstance): Bounds[] {
  const distribution = container.layout?.distribution || 'equal';
  const orientation = container.layout?.orientation || 'vertical';
  const gap = container.layout?.gap || DEFAULT_SPACING_BETWEEN_ITEMS;
  const horizontalAlignment = container.layout?.horizontalAlignment || 'left';
  const verticalAlignment = container.layout?.verticalAlignment || 'top';

  const axis = getAxisMapping(orientation);
  const isVertical = orientation === 'vertical';

  // Determine primary and secondary alignments
  const primaryAlignment = isVertical ? verticalAlignment : horizontalAlignment;
  const secondaryAlignment = isVertical ? horizontalAlignment : verticalAlignment;

  return calculateLayout(
    itemDimensions,
    distribution,
    gap,
    container.bounds,
    axis,
    primaryAlignment,
    secondaryAlignment,
    isVertical
  );
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

  const axis = getAxisMapping(orientation);
  return calculateChildrenBounds(bounds, childCount, distribution, gap, axis);
}

/**
 * Axis mapping for orientation-agnostic calculations
 */
interface AxisMapping {
  primary: 'width' | 'height';
  secondary: 'height' | 'width';
  primaryStart: 'left' | 'top';
  secondaryStart: 'top' | 'left';
}

/**
 * Get axis mapping based on orientation
 */
function getAxisMapping(orientation: 'horizontal' | 'vertical'): AxisMapping {
  return orientation === 'horizontal'
    ? { primary: 'width', secondary: 'height', primaryStart: 'left', secondaryStart: 'top' }
    : { primary: 'height', secondary: 'width', primaryStart: 'top', secondaryStart: 'left' };
}

/**
 * Calculate max bounds for children in an axis-agnostic way
 */
function calculateChildrenBounds(
  bounds: Bounds,
  childCount: number,
  distribution: string,
  gap: number,
  axis: AxisMapping
): Bounds[] {
  // Calculate base item size assuming equal distribution
  const totalSpacing = gap * (childCount - 1);
  const availableSpace = bounds[axis.primary] - totalSpacing;
  const baseItemSize = availableSpace / childCount;

  let sizes: number[] = [];
  let spacing = gap;
  let offset = 0;

  // Ratio distribution (e.g., '30/70', '1/8')
  if (distribution.includes('/')) {
    const parts = distribution.split('/');
    if (parts.length === childCount && parts.every((p) => !isNaN(Number(p)))) {
      const ratios = parts.map(Number);
      const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
      sizes = ratios.map((r) => (bounds[axis.primary] * r) / totalRatio);
      spacing = 0; // Ratio distribution doesn't use gap
      offset = 0;
    } else {
      // Fallback to equal distribution
      sizes = Array(childCount).fill(baseItemSize);
      spacing = gap;
      offset = 0;
    }
  }
  // Space-between distribution
  else if (distribution === 'space-between' && childCount > 1) {
    const totalItemSize = childCount * baseItemSize;
    const remainingSpace = bounds[axis.primary] - totalItemSize;
    sizes = Array(childCount).fill(baseItemSize);
    spacing = remainingSpace / (childCount - 1);
    offset = 0;
  }
  // Space-around distribution
  else if (distribution === 'space-around' && childCount > 1) {
    const totalItemSize = childCount * baseItemSize;
    const remainingSpace = bounds[axis.primary] - totalItemSize;
    const spaceUnit = remainingSpace / (childCount + 1);
    sizes = Array(childCount).fill(baseItemSize);
    spacing = spaceUnit;
    offset = spaceUnit;
  }
  // Equal distribution (default)
  else {
    sizes = Array(childCount).fill(baseItemSize);
    spacing = gap;
    offset = 0;
  }

  // Build bounds array
  let currentPrimary = bounds[axis.primaryStart] + offset;
  const secondarySize = bounds[axis.secondary];
  const secondaryStart = bounds[axis.secondaryStart];

  return sizes.map((primarySize) => {
    const position: Bounds =
      axis.primary === 'width'
        ? {
            left: currentPrimary,
            top: secondaryStart,
            width: primarySize,
            height: secondarySize,
          }
        : {
            left: secondaryStart,
            top: currentPrimary,
            width: secondarySize,
            height: primarySize,
          };

    currentPrimary += primarySize + spacing;
    return position;
  });
}

/**
 * Calculate alignment position
 */
function calculateAlignment(
  alignment: string,
  itemSize: number,
  containerSize: number,
  containerStart: number
): number {
  switch (alignment) {
    case 'center':
      return containerStart + (containerSize - itemSize) / 2;
    case 'right':
    case 'bottom':
      return containerStart + containerSize - itemSize;
    default:
      return containerStart;
  }
}

/**
 * Orientation-agnostic layout calculator
 */
function calculateLayout(
  itemDimensions: Size[],
  distribution: string,
  gap: number,
  bounds: Bounds,
  axis: AxisMapping,
  primaryAlignment: string,
  secondaryAlignment: string,
  isVertical: boolean
): Bounds[] {
  const itemSizes = itemDimensions.map((dim) => dim[axis.primary]);
  const totalItemsSize = itemSizes.reduce((sum, size) => sum + size, 0);

  let sizes: number[] = itemSizes;
  let spacing = gap;
  let offset = 0;

  // Ratio distribution (e.g., '1/8')
  if (distribution.includes('/')) {
    const parts = distribution.split('/');
    if (parts.length === itemDimensions.length && parts.every((p) => !isNaN(Number(p)))) {
      const ratios = parts.map(Number);
      const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
      const totalSpacing = gap * (itemDimensions.length - 1);
      const availableForItems = bounds[axis.primary] - totalSpacing;

      sizes = ratios.map((ratio) => (availableForItems * ratio) / totalRatio);
      spacing = gap;
      offset = 0;
    }
  }
  // Space-between distribution
  else if (distribution === 'space-between') {
    if (itemDimensions.length === 1) {
      spacing = 0;
      offset = (bounds[axis.primary] - totalItemsSize) / 2;
    } else {
      spacing = (bounds[axis.primary] - totalItemsSize) / (itemDimensions.length - 1);
      offset = 0;
    }
  }
  // Space-around distribution
  else if (distribution === 'space-around') {
    const spaceUnit = (bounds[axis.primary] - totalItemsSize) / (itemDimensions.length + 1);
    spacing = spaceUnit;
    offset = spaceUnit;
  }
  // Equal distribution (default)
  else {
    const totalNeeded = totalItemsSize + (itemDimensions.length - 1) * gap;
    const extraSpace = bounds[axis.primary] - totalNeeded;

    if (extraSpace > 0) {
      // Apply primary alignment
      if (primaryAlignment === 'center') {
        offset = extraSpace / 2;
      } else if (primaryAlignment === 'right' || primaryAlignment === 'bottom') {
        offset = extraSpace;
      } else {
        offset = 0; // left or top
      }

      const maxOffset = isVertical ? 80 : Infinity;
      offset = Math.min(offset, maxOffset);
    } else {
      offset = 0;
    }

    spacing = gap;
  }

  // Position items along primary axis
  let currentPrimary = bounds[axis.primaryStart] + offset;

  return itemDimensions.map((dim, idx) => {
    const primarySize = sizes[idx];
    const secondarySize = dim[axis.secondary];

    const secondaryPosition = calculateAlignment(
      secondaryAlignment,
      secondarySize,
      bounds[axis.secondary],
      bounds[axis.secondaryStart]
    );

    // Build bounds object by mapping primary/secondary to actual coordinates
    const position: Bounds =
      axis.primary === 'width'
        ? {
            left: currentPrimary,
            top: secondaryPosition,
            width: primarySize,
            height: secondarySize,
          }
        : {
            left: secondaryPosition,
            top: currentPrimary,
            width: secondarySize,
            height: primarySize,
          };

    currentPrimary += primarySize + spacing;
    return position;
  });
}
