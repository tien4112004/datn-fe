import type {
  LayoutBlockInstance,
  LayoutBlockConfig,
  SlideLayoutBlockConfig,
  Bounds,
  WrapConfig,
} from '../types';
import { DEFAULT_WRAP_CONFIG } from './layoutConstants';
import { getChildrenMaxBounds } from './positioning';

/**
 * Expands a childTemplate into N child instances with calculated bounds
 * @param templateContainer - Container config with childTemplate
 * @param parentBounds - Bounds of parent container
 * @param data - Array of data items to map to children (length determines count if auto)
 */
export function buildChildrenFromChildTemplate(
  templateContainer: LayoutBlockConfig,
  parentBounds: Bounds,
  data: any[]
): LayoutBlockInstance[] {
  if (!templateContainer.childTemplate) return [];

  const childTemplate = templateContainer.childTemplate;

  // Determine count from data or template
  const count = childTemplate.count === 'auto' ? data.length : childTemplate.count;

  if (!childTemplate.structure || count === 0) {
    return [];
  }

  // Calculate bounds using wrap layout
  const wrapConfig = childTemplate.wrap || DEFAULT_WRAP_CONFIG;

  const wrapLayout = calculateWrapLayout(
    count,
    parentBounds,
    wrapConfig,
    templateContainer.layout?.orientation || 'vertical',
    templateContainer.layout?.gap || 0
  );

  // Create instances with calculated bounds, passing corresponding data item
  const children: LayoutBlockInstance[] = [];
  for (let i = 0; i < count; i++) {
    const itemData = data[i]; // Could be object, string, number, etc.
    const instance = buildInstanceWithBounds(
      childTemplate.structure,
      wrapLayout.itemBounds[i],
      itemData ? [itemData] : undefined // Wrap in array for nested templates,
    );
    children.push(instance);
  }

  return children;
}

/**
 * Recursively builds layout instance tree with calculated bounds for all descendants
 * @param config - Layout block configuration
 * @param bounds - Bounds for this instance
 * @param data - Data array for child population (undefined for leaf nodes)
 */
export function buildInstanceWithBounds(
  config: SlideLayoutBlockConfig,
  bounds: Bounds,
  data?: any[]
): LayoutBlockInstance {
  // Create base instance with assigned bounds
  const instance: LayoutBlockInstance = {
    type: config.type,
    id: config.id,
    bounds,
    label: config.label,
    border: config.border,
    shadow: config.shadow,
    layout: config.layout,
  };

  // Add type-specific properties
  if ('text' in config) {
    (instance as any).text = config.text;
    (instance as any).background = config.background;
  }

  // Handle children - either static or from template
  if (config.children) {
    // Static children - calculate bounds using getChildrenMaxBounds
    const childrenBounds = getChildrenMaxBounds(bounds, {
      distribution: config.layout?.distribution,
      childCount: config.children.length,
      orientation: config.layout?.orientation,
      gap: config.layout?.gap,
    });

    // Pass same data to all static children
    instance.children = config.children.map((childConfig, index) =>
      buildInstanceWithBounds(childConfig, childrenBounds[index], data)
    );
  } else if (config.childTemplate) {
    // Dynamic children from template - expand with data mapping
    instance.children = buildChildrenFromChildTemplate(config, bounds, data || []);
  }

  return instance;
}

/**
 * Calculate wrap layout for items
 */
export function calculateWrapLayout(
  itemCount: number,
  containerBounds: Bounds,
  wrapConfig: WrapConfig,
  orientation: 'horizontal' | 'vertical',
  gap: number
): {
  lines: number;
  itemsPerLine: number[];
  itemBounds: Bounds[];
} {
  if (!wrapConfig || !wrapConfig.enabled) {
    return {
      lines: 1,
      itemsPerLine: [itemCount],
      itemBounds: [],
    };
  }

  const maxPerLine: number = wrapConfig.maxItemsPerLine || itemCount;
  const distributions = distributeItems(itemCount, maxPerLine, wrapConfig.distribution || 'balanced');
  const lines = distributions.length;
  const lineSpacing = wrapConfig.lineSpacing || 0;
  const shrinkFactor = 0.8;

  const itemBounds: Bounds[] = [];

  if (orientation === 'horizontal') {
    // Calculate line heights
    const lineHeight = (containerBounds.height - (lines - 1) * lineSpacing) / lines;

    distributions.forEach((itemsInLine, lineIndex) => {
      const isAlternatingLine = wrapConfig.alternating && lineIndex % 2 === 1;

      // Calculate effective container width for this line
      const effectiveContainerWidth = isAlternatingLine
        ? containerBounds.width * shrinkFactor
        : containerBounds.width;

      // Calculate spacing and item width based on effective container width
      const totalSpacing = (itemsInLine - 1) * gap;
      const itemWidth = (effectiveContainerWidth - totalSpacing) / itemsInLine;

      // Center the line if it's shrunk
      const lineOffset = isAlternatingLine ? (containerBounds.width - effectiveContainerWidth) / 2 : 0;

      // Calculate line top position
      const lineTop = containerBounds.top + lineIndex * (lineHeight + lineSpacing);

      // Position items in the line
      for (let itemIndex = 0; itemIndex < itemsInLine; itemIndex++) {
        const left = containerBounds.left + lineOffset + itemIndex * (itemWidth + gap);

        itemBounds.push({
          left,
          top: lineTop,
          width: itemWidth,
          height: lineHeight,
        });
      }
    });
  } else {
    // Vertical orientation (columns)
    const lineWidth = (containerBounds.width - (lines - 1) * lineSpacing) / lines;

    distributions.forEach((itemsInLine, lineIndex) => {
      const isAlternatingLine = wrapConfig.alternating && lineIndex % 2 === 1;

      // Calculate effective container height for this column
      const effectiveContainerHeight = isAlternatingLine
        ? containerBounds.height * shrinkFactor
        : containerBounds.height;

      // Calculate spacing and item height based on effective container height
      const totalSpacing = (itemsInLine - 1) * gap;
      const itemHeight = (effectiveContainerHeight - totalSpacing) / itemsInLine;

      // Center the column if it's shrunk
      const columnOffset = isAlternatingLine ? (containerBounds.height - effectiveContainerHeight) / 2 : 0;

      // Calculate column left position
      const lineLeft = containerBounds.left + lineIndex * (lineWidth + lineSpacing);

      // Position items in the column
      for (let itemIndex = 0; itemIndex < itemsInLine; itemIndex++) {
        const top = containerBounds.top + columnOffset + itemIndex * (itemHeight + gap);

        itemBounds.push({
          left: lineLeft,
          top,
          width: lineWidth,
          height: itemHeight,
        });
      }
    });
  }

  return {
    lines,
    itemsPerLine: distributions,
    itemBounds,
  };
}

/**
 * Distribute items across lines/columns
 */
export function distributeItems(
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
