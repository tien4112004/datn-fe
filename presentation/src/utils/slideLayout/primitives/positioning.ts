import type { Bounds, Size, LayoutBlockInstance, DistributionType, WrapConfig } from '../types';
import { DEFAULT_SPACING_BETWEEN_ITEMS } from './layoutConstants';

/**
 * Calculates final bounds for items within a container based on measured dimensions.
 * Uses axis-agnostic algorithm to support both horizontal and vertical orientations.
 *
 * Key features:
 * - Supports multiple distribution strategies (equal, space-between, ratios)
 * - Handles alignment in both primary and secondary axes
 * - Works identically for horizontal and vertical layouts via axis mapping
 *
 * @param itemDimensions - Pre-measured dimensions of each item
 * @param container - Parent container with layout configuration and bounds
 * @returns Array of calculated bounds for each item in order
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
 * Pre-calculates maximum available bounds for static children before measuring.
 * Divides parent container space according to distribution strategy.
 *
 * Used when child count is known beforehand (static children).
 * For dynamic children (from templates), use calculateWrapLayout instead.
 *
 * @param bounds - Parent container bounds
 * @param options - Distribution and orientation settings
 * @returns Array of pre-allocated bounds for each child
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
 * Configuration for multi-line/multi-column wrap layout calculation
 */
export interface WrapLayoutOptions {
  itemCount?: number;
  wrapConfig?: WrapConfig;
  orientation?: 'horizontal' | 'vertical';
  gap?: number;
  distribution?: DistributionType;
}

export interface WrapLayoutResult {
  lines: number;
  itemsPerLine: number[];
  itemBounds: Bounds[];
}

/**
 * Calculates multi-line/multi-column layout for items that wrap.
 *
 * Features:
 * - Balanced, top-heavy, or bottom-heavy distributions
 * - Alternating line offsets (e.g., zigzag patterns)
 * - Synchronized sizing across lines (prevents uneven item sizes)
 * - Works for both horizontal wrap (multiple columns) and vertical wrap (multiple rows)
 *
 * @example
 * // 6 items, max 4 per line, balanced distribution -> 3/3 split
 * calculateWrapLayout(bounds, { itemCount: 6, wrapConfig: { maxItemsPerLine: 4, wrapDistribution: 'balanced' }})
 *
 * @param bounds - Container bounds to wrap within
 * @param options - Wrap configuration options
 * @returns Layout result with line counts and calculated item bounds
 */
export function calculateWrapLayout(bounds: Bounds, options?: WrapLayoutOptions): WrapLayoutResult {
  const {
    itemCount = 0,
    wrapConfig,
    orientation = 'vertical',
    gap = DEFAULT_SPACING_BETWEEN_ITEMS,
    distribution = 'equal',
  } = options || {};

  return calculateWrapLayoutInternal(itemCount, bounds, wrapConfig, orientation, gap, distribution);
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

/**
 * Internal implementation of wrap layout calculation
 */
function calculateWrapLayoutInternal(
  itemCount: number,
  containerBounds: Bounds,
  wrapConfig: WrapConfig | undefined,
  orientation: 'horizontal' | 'vertical',
  gap: number,
  distribution: DistributionType
): WrapLayoutResult {
  // Non-wrap case: use simple stacking
  if (!wrapConfig || !wrapConfig.enabled) {
    const itemBounds = getChildrenMaxBounds(containerBounds, {
      distribution: 'equal',
      childCount: itemCount,
      orientation,
      gap,
    });

    return {
      lines: 1,
      itemsPerLine: [itemCount],
      itemBounds,
    };
  }

  // Wrap case: multi-line/column layout
  const maxPerLine = wrapConfig.maxItemsPerLine || itemCount;
  const distributions = distributeItems(itemCount, maxPerLine, wrapConfig.wrapDistribution || 'balanced');
  const lineCount = distributions.length;
  const lineSpacing = wrapConfig.lineSpacing || 0;

  const axis = getAxisMapping(orientation);
  const itemBounds: Bounds[] = [];

  // Calculate line/column size (perpendicular to primary axis)
  const lineSize = (containerBounds[axis.secondary] - (lineCount - 1) * lineSpacing) / lineCount;

  distributions.forEach((itemsInLine, lineIndex) => {
    const isAlternatingLine = wrapConfig.alternating && lineIndex % 2 === 1;

    // Calculate effective container size and offsets for this line/column
    let effectiveContainerSize = containerBounds[axis.primary];
    let lineStartOffset = 0;

    if (isAlternatingLine && wrapConfig.alternating) {
      effectiveContainerSize =
        containerBounds[axis.primary] - wrapConfig.alternating.start - wrapConfig.alternating.end;
      lineStartOffset = wrapConfig.alternating.start;
    }

    // Calculate item primary size
    let itemPrimarySize: number;
    let lineContentSize: number;
    let itemGap = gap;

    if (wrapConfig.syncSize) {
      // Fixed-size mode: use size based on the fullest line
      const totalSpacing = (maxPerLine - 1) * gap;
      itemPrimarySize = (effectiveContainerSize - totalSpacing) / maxPerLine;
      lineContentSize = itemsInLine * itemPrimarySize + (itemsInLine - 1) * gap;
    } else {
      // Original mode: divide space equally among items in this line
      const totalSpacing = (itemsInLine - 1) * gap;
      itemPrimarySize = (effectiveContainerSize - totalSpacing) / itemsInLine;
      lineContentSize = effectiveContainerSize;
    }

    // Calculate offset based on distribution (for spare items in partial lines)
    let additionalOffset = 0;

    if (wrapConfig.syncSize && itemsInLine < maxPerLine) {
      const availableSpace = effectiveContainerSize - lineContentSize;

      if (distribution === 'space-between') {
        const extraGap = itemsInLine > 1 ? availableSpace / (itemsInLine - 1) : 0;
        itemGap = gap + extraGap;
      } else if (distribution === 'space-around') {
        const extraGap = availableSpace / itemsInLine;
        additionalOffset = extraGap / 2;
        itemGap = gap + extraGap;
      }
    }

    // Calculate line/column secondary position
    const lineSecondaryPos = containerBounds[axis.secondaryStart] + lineIndex * (lineSize + lineSpacing);

    // Position items in the line/column
    for (let itemIndex = 0; itemIndex < itemsInLine; itemIndex++) {
      const primaryPos =
        containerBounds[axis.primaryStart] +
        lineStartOffset +
        additionalOffset +
        itemIndex * (itemPrimarySize + itemGap);

      // Build bounds by mapping primary/secondary to actual coordinates
      const bounds: Bounds =
        axis.primary === 'width'
          ? {
              left: primaryPos,
              top: lineSecondaryPos,
              width: itemPrimarySize,
              height: lineSize,
            }
          : {
              left: lineSecondaryPos,
              top: primaryPos,
              width: lineSize,
              height: itemPrimarySize,
            };

      itemBounds.push(bounds);
    }
  });

  return {
    lines: lineCount,
    itemsPerLine: distributions,
    itemBounds,
  };
}

/**
 * Distributes items across multiple lines/columns based on strategy.
 *
 * Strategies:
 * - 'balanced': Equal items per line (e.g., 7 items, max 3 -> [3,2,2] or [3,3,1])
 * - 'top-heavy': Decreasing pyramid (e.g., 6 items -> [3,2,1])
 * - 'bottom-heavy': Increasing pyramid (e.g., 6 items -> [1,2,3])
 *
 * @param itemCount - Total number of items to distribute
 * @param maxPerLine - Maximum items allowed per line
 * @param type - Distribution strategy
 * @returns Array where each element is the count of items in that line
 */
function distributeItems(
  itemCount: number,
  maxPerLine: number,
  type: 'balanced' | 'top-heavy' | 'bottom-heavy'
): number[] {
  if (itemCount <= 0) return [];
  if (maxPerLine <= 0) {
    console.warn('maxPerLine should be greater than 0');
  }
  if (itemCount <= maxPerLine) return [itemCount];

  if (type === 'balanced') {
    const lineCount = Math.ceil(itemCount / maxPerLine);
    const baseItemsPerLine = Math.floor(itemCount / lineCount);
    const remainder = itemCount % lineCount;

    // Create array with base distribution
    const distribution = Array(lineCount).fill(baseItemsPerLine);

    // Distribute remainder items (one extra to first 'remainder' lines)
    for (let i = 0; i < remainder; i++) {
      distribution[i]++;
    }

    return distribution;
  }

  if (type === 'top-heavy') {
    const distribution: number[] = [];
    let remaining = itemCount;
    let currentMax = maxPerLine;

    while (remaining > 0) {
      const itemsInLine = Math.min(remaining, currentMax);
      distribution.push(itemsInLine);
      remaining -= itemsInLine;

      // Decrease items per line for pyramid effect
      currentMax = Math.max(1, currentMax - 1);
    }

    return distribution;
  }

  if (type === 'bottom-heavy') {
    const distribution: number[] = [];
    let remaining = itemCount;
    let currentMin = 1;

    while (remaining > 0) {
      const itemsInLine = Math.min(remaining, currentMin);
      distribution.push(itemsInLine);
      remaining -= itemsInLine;

      // Increase items per line for reverse pyramid effect
      currentMin = Math.min(maxPerLine, currentMin + 1);
    }

    return distribution;
  }

  return [itemCount];
}
