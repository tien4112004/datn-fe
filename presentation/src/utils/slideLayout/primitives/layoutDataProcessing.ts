import type { LayoutBlockConfig, LayoutBlockInstance, TextLayoutBlockInstance, Bounds } from '../types';
import { buildInstanceWithBounds, buildChildrenFromChildTemplate } from './layoutInstanceBuilder';
import { getChildrenMaxBounds } from './layoutPositioning';

/**
 * Extract data structure detection and normalization
 */
export function normalizeDataStructure(
  data: Record<string, string[]>,
  config: LayoutBlockConfig,
  bounds: Bounds
): { dataMap: Map<string, string[]>; processedData: any[]; instance?: LayoutBlockInstance } {
  const dataMap = new Map<string, string[]>();

  // Handle object data (label/value split or nested)
  if (config.childTemplate && !config.children) {
    // Flat with label/value split
    return processFlatObjectData(data, dataMap);
  } else {
    // Nested structure - returns instance directly
    const result = processNestedData(data, config, dataMap, bounds);
    return result;
  }
}

/**
 * Extract label group collection
 */
export function collectLabelGroups(container: LayoutBlockInstance): Map<string, TextLayoutBlockInstance[]> {
  const groups = new Map<string, TextLayoutBlockInstance[]>();
  collectLabelGroupsRecursive(container, groups);
  return groups;
}

/**
 * Extract flat object data processing
 */
export function processFlatObjectData(
  data: Record<string, string[]>,
  dataMap: Map<string, string[]>
): { dataMap: Map<string, string[]>; processedData: any[] } {
  for (const [key, values] of Object.entries(data)) {
    dataMap.set(key, values);
  }
  const processedData = Object.values(data)[0] || [];
  return { dataMap, processedData };
}

/**
 * Extract nested data processing
 */
export function processNestedData(
  data: Record<string, string[]>,
  config: LayoutBlockConfig,
  dataMap: Map<string, string[]>,
  bounds: Bounds
): { dataMap: Map<string, string[]>; processedData: any[]; instance: LayoutBlockInstance } {
  // Build tree with children having proper data distribution
  const instance = buildInstanceWithBounds(config, bounds, undefined);

  if (config.children && instance.children) {
    const childrenBounds = getChildrenMaxBounds(bounds, {
      distribution: config.distribution,
      childCount: config.children.length,
      orientation: config.orientation,
      spacingBetweenItems: config.spacingBetweenItems,
    });

    const dataArray = Array.isArray(data) ? data : Object.values(data);

    // Process children and collect data mapping
    const processedChildren = processChildrenData(config.children, childrenBounds, dataArray, dataMap);

    // Assign processed children back to instance
    instance.children = processedChildren;
  }

  return { dataMap, processedData: Object.values(data), instance };
}

/**
 * Extract children data processing
 */
export function processChildrenData(
  children: LayoutBlockConfig[],
  childrenBounds: Bounds[],
  dataArray: any[],
  dataMap: Map<string, string[]>
): LayoutBlockInstance[] {
  return children.map((childConfig, index) => {
    const childData = dataArray[index] || [];
    const childInstance = buildChildrenFromChildTemplate(childConfig, childrenBounds[index], childData);

    // Track data for this child's label
    if (childConfig.childTemplate?.structure?.label) {
      const label = childConfig.childTemplate.structure.label;
      if (!dataMap.has(label)) dataMap.set(label, []);
      dataMap.get(label)!.push(...childData);
    }

    return {
      ...childConfig,
      bounds: childrenBounds[index],
      padding: childConfig.padding || { top: 0, bottom: 0, left: 0, right: 0 },
      children: childInstance,
    } as LayoutBlockInstance;
  });
}

/**
 * Extract recursive label group collection
 */
export function collectLabelGroupsRecursive(
  container: LayoutBlockInstance,
  groups: Map<string, TextLayoutBlockInstance[]>
): void {
  if (container.label) {
    if (!groups.has(container.label)) {
      groups.set(container.label, []);
    }
    groups.get(container.label)!.push(container as TextLayoutBlockInstance);
  }

  if (container.children) {
    container.children.forEach((child) => collectLabelGroupsRecursive(child, groups));
  }
}

/**
 * Get columns layout (utility for column-based layouts)
 */
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
