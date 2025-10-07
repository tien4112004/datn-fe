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
    templateContainer.layout?.gap || 0,
    templateContainer.layout?.distribution
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
  gap: number,
  distribution?: 'equal' | 'space-between' | 'space-around' | string
): {
  lines: number;
  itemsPerLine: number[];
  itemBounds: Bounds[];
} {
  if (!wrapConfig || !wrapConfig.enabled) {
    // Calculate bounds for single line/column layout
    const itemBounds: Bounds[] = [];

    if (orientation === 'vertical') {
      // Stack items vertically
      const totalSpacing = (itemCount - 1) * gap;
      const itemHeight = (containerBounds.height - totalSpacing) / itemCount;

      for (let i = 0; i < itemCount; i++) {
        itemBounds.push({
          left: containerBounds.left,
          top: containerBounds.top + i * (itemHeight + gap),
          width: containerBounds.width,
          height: itemHeight,
        });
      }
    } else {
      // Stack items horizontally
      const totalSpacing = (itemCount - 1) * gap;
      const itemWidth = (containerBounds.width - totalSpacing) / itemCount;

      for (let i = 0; i < itemCount; i++) {
        itemBounds.push({
          left: containerBounds.left + i * (itemWidth + gap),
          top: containerBounds.top,
          width: itemWidth,
          height: containerBounds.height,
        });
      }
    }

    return {
      lines: 1,
      itemsPerLine: [itemCount],
      itemBounds,
    };
  }

  const maxPerLine: number = wrapConfig.maxItemsPerLine || itemCount;
  const distributions = distributeItems(itemCount, maxPerLine, wrapConfig.wrapDistribution || 'balanced');
  const lines = distributions.length;
  const lineSpacing = wrapConfig.lineSpacing || 0;

  const itemBounds: Bounds[] = [];

  if (orientation === 'horizontal') {
    // Calculate line heights
    const lineHeight = (containerBounds.height - (lines - 1) * lineSpacing) / lines;

    distributions.forEach((itemsInLine, lineIndex) => {
      const isAlternatingLine = wrapConfig.alternating && lineIndex % 2 === 1;

      // Calculate effective container width and offsets for this line
      let effectiveContainerWidth = containerBounds.width;
      let lineStartOffset = 0;

      if (isAlternatingLine && wrapConfig.alternating) {
        // Apply alternating offsets: shrink width by start + end, shift left by start
        effectiveContainerWidth =
          containerBounds.width - wrapConfig.alternating.start - wrapConfig.alternating.end;
        lineStartOffset = wrapConfig.alternating.start;
      }

      // Calculate item width
      let itemWidth: number;
      let lineContentWidth: number;
      let itemGap = gap; // Local gap that may be adjusted for distribution

      if (wrapConfig.syncSize) {
        // Fixed-size mode: use size based on the fullest line
        const totalSpacing = (maxPerLine - 1) * gap;
        itemWidth = (effectiveContainerWidth - totalSpacing) / maxPerLine;
        lineContentWidth = itemsInLine * itemWidth + (itemsInLine - 1) * gap;
      } else {
        // Original mode: divide space equally among items in this line
        const totalSpacing = (itemsInLine - 1) * gap;
        itemWidth = (effectiveContainerWidth - totalSpacing) / itemsInLine;
        lineContentWidth = effectiveContainerWidth;
      }

      // Calculate line offset based on distribution (for spare items in partial lines)
      let additionalOffset = 0;

      if (wrapConfig.syncSize && itemsInLine < maxPerLine) {
        const availableSpace = effectiveContainerWidth - lineContentWidth;

        // Use parent distribution for alignment
        if (distribution === 'space-between') {
          // Adjust gap to distribute space between items
          const extraGap = itemsInLine > 1 ? availableSpace / (itemsInLine - 1) : 0;
          itemGap = gap + extraGap;
        } else if (distribution === 'space-around') {
          // Distribute space around items
          const extraGap = availableSpace / itemsInLine;
          additionalOffset = extraGap / 2;
          itemGap = gap + extraGap;
        }
        // 'equal' or other: items stay left-aligned (no additional offset)
      }

      // Calculate line top position
      const lineTop = containerBounds.top + lineIndex * (lineHeight + lineSpacing);

      // Position items in the line
      for (let itemIndex = 0; itemIndex < itemsInLine; itemIndex++) {
        const left =
          containerBounds.left + lineStartOffset + additionalOffset + itemIndex * (itemWidth + itemGap);

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

      // Calculate effective container height and offsets for this column
      let effectiveContainerHeight = containerBounds.height;
      let columnStartOffset = 0;

      if (isAlternatingLine && wrapConfig.alternating) {
        // Apply alternating offsets: shrink height by start + end, shift top by start
        effectiveContainerHeight =
          containerBounds.height - wrapConfig.alternating.start - wrapConfig.alternating.end;
        columnStartOffset = wrapConfig.alternating.start;
      }

      // Calculate item height
      let itemHeight: number;
      let columnContentHeight: number;
      let itemGap = gap; // Local gap that may be adjusted for distribution

      if (wrapConfig.syncSize) {
        // Fixed-size mode: use size based on the fullest column
        const totalSpacing = (maxPerLine - 1) * gap;
        itemHeight = (effectiveContainerHeight - totalSpacing) / maxPerLine;
        columnContentHeight = itemsInLine * itemHeight + (itemsInLine - 1) * gap;
      } else {
        // Original mode: divide space equally among items in this column
        const totalSpacing = (itemsInLine - 1) * gap;
        itemHeight = (effectiveContainerHeight - totalSpacing) / itemsInLine;
        columnContentHeight = effectiveContainerHeight;
      }

      // Calculate column offset based on distribution (for spare items in partial columns)
      let additionalOffset = 0;

      if (wrapConfig.syncSize && itemsInLine < maxPerLine) {
        const availableSpace = effectiveContainerHeight - columnContentHeight;

        // Use parent distribution for alignment
        if (distribution === 'space-between') {
          // Adjust gap to distribute space between items
          const extraGap = itemsInLine > 1 ? availableSpace / (itemsInLine - 1) : 0;
          itemGap = gap + extraGap;
        } else if (distribution === 'space-around') {
          // Distribute space around items
          const extraGap = availableSpace / itemsInLine;
          additionalOffset = extraGap / 2;
          itemGap = gap + extraGap;
        }
        // 'equal' or other: items stay top-aligned (no additional offset)
      }

      // Calculate column left position
      const lineLeft = containerBounds.left + lineIndex * (lineWidth + lineSpacing);

      // Position items in the column
      for (let itemIndex = 0; itemIndex < itemsInLine; itemIndex++) {
        const top =
          containerBounds.top + columnStartOffset + additionalOffset + itemIndex * (itemHeight + itemGap);

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
