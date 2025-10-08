import type { LayoutBlockInstance, LayoutBlockConfig, SlideLayoutBlockConfig, Bounds } from '../types';
import { DEFAULT_WRAP_CONFIG } from './layoutConstants';
import { calculateWrapLayout, getChildrenMaxBounds } from './positioning';

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

  const wrapLayout = calculateWrapLayout(parentBounds, {
    itemCount: count,
    wrapConfig,
    orientation: templateContainer.layout?.orientation || 'vertical',
    gap: templateContainer.layout?.gap || 0,
    distribution: templateContainer.layout?.distribution,
  });

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
