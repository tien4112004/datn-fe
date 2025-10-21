import type { PPTImageElement, SlideTheme, PPTElement } from '@/types/slides';
import type {
  TemplateContainerConfig,
  ImageLayoutBlockInstance,
  TextLayoutBlockInstance,
  Bounds,
  LayoutBlockInstance,
  LayoutBlockConfig,
} from '../types';
import {
  createImageElement,
  getAllDescendantInstances,
  createCard,
  createTextElement,
  buildInstanceWithBounds,
  getChildrenMaxBounds,
  buildChildrenFromChildTemplate,
  calculateUnifiedFontSizeForLabels,
  layoutItemsInBlock,
} from '.';
import { createHtmlElement, createTextPPTElement, createListElements } from './elementCreators';
import {
  DEFAULT_MIN_FONT_SIZE,
  DEFAULT_LABEL_TO_VALUE_RATIO,
  FONT_SIZE_RANGE_LABEL,
  FONT_SIZE_RANGE_CONTENT,
  FONT_SIZE_RANGE_TITLE,
} from './layoutConstants';
import { measureElement } from './elementMeasurement';

export async function buildImageElement(
  src: string,
  container: TemplateContainerConfig
): Promise<PPTImageElement> {
  const imageInstance = {
    ...container,
    bounds: container.bounds,
  } as ImageLayoutBlockInstance;

  return await createImageElement(src, imageInstance);
}

export function buildCards(instance: LayoutBlockInstance): PPTElement[] {
  const list = getAllDescendantInstances(instance)
    .map((inst) => {
      if (!inst.border) return null;
      return createCard(inst);
    })
    .filter((el) => el !== null) as PPTElement[];

  return list;
}

export function buildTitle(title: string, config: TemplateContainerConfig, theme: SlideTheme): PPTElement[] {
  const titleInstance = {
    ...config,
    bounds: config.bounds,
  } as TextLayoutBlockInstance;

  const titleElement = createTextElement(
    title,
    titleInstance,
    titleInstance.text?.fontSizeRange || FONT_SIZE_RANGE_TITLE
  );

  return [titleElement];
}

export function buildText(content: string, config: TemplateContainerConfig): PPTElement[] {
  const textInstance = {
    ...config,
    bounds: config.bounds,
  } as TextLayoutBlockInstance;

  const textElement = createTextElement(
    content,
    textInstance,
    textInstance.text?.fontSizeRange || FONT_SIZE_RANGE_CONTENT
  );

  return [textElement];
}

/**
 * Builds a combined list element with unified font sizing.
 * Creates ProseMirror-compatible <ul><li><p> or <ol><li><p> structure.
 * Returns 1 or 2 elements depending on whether content needs column wrapping.
 *
 * @param contents - Array of HTML content strings for each list item
 * @param config - Container configuration
 * @param listType - Type of list: 'ul' for unordered or 'ol' for ordered (default: 'ul')
 * @returns Array containing one or two list elements (split into columns if needed)
 */
export function buildCombinedList(contents: string[], config: TemplateContainerConfig): PPTElement[] {
  const textInstance = {
    ...config,
    bounds: config.bounds,
  } as TextLayoutBlockInstance;

  const listElements = createListElements(
    contents,
    textInstance,
    textInstance.text?.fontSizeRange || FONT_SIZE_RANGE_CONTENT
  );

  return listElements;
}

/**
 * Builds layout with unified font sizing across all labeled elements.
 * This is the main function for creating content-heavy layouts (lists, tables, etc.)
 *
 * Algorithm (single-pass optimization):
 * 1. Normalize data structure (flat vs nested)
 * 2. Build layout tree with bounds
 * 3. Collect elements by label
 * 4. Calculate unified font size per label (smallest size that fits all instances)
 * 5. Create HTML elements with calculated sizes
 * 6. Measure and position elements
 * 7. Convert to PPT elements
 *
 * Key concept: Elements with the same label share a unified font size to ensure
 * visual consistency (e.g., all "content" items have the same font size)
 *
 * @param config - Content container configuration template
 * @param bounds - Fixed content bounds (from parent allocation)
 * @param data - Data items as object mapping labels to string arrays
 * @returns Layout instance with unified font sizes and PPT elements organized by label
 *
 * @example
 * // Flat structure with label/value split
 * buildLayoutWithUnifiedFontSizing(config, bounds, {
 *   label: ['Q1', 'Q2', 'Q3'],
 *   content: ['Revenue: $100K', 'Revenue: $150K', 'Revenue: $200K']
 * })
 *
 * @example
 * // Nested structure
 * buildLayoutWithUnifiedFontSizing(config, bounds, {
 *   column1: ['Item 1', 'Item 2'],
 *   column2: ['Item A', 'Item B']
 * })
 */
export function buildLayoutWithUnifiedFontSizing(
  config: LayoutBlockConfig,
  bounds: Bounds,
  data: Record<string, string[]>
): {
  instance: LayoutBlockInstance;
  elements: Record<string, PPTElement[]>;
  fontSizes: Record<string, number>;
} {
  // Step 1: Process and normalize data
  const {
    dataMap,
    processedData,
    instance: prebuiltInstance,
  } = _normalizeDataStructure(data, config, bounds);

  // Step 2: Build layout tree (skip if already built for nested structures)
  const instance = prebuiltInstance || buildInstanceWithBounds(config, bounds, processedData);

  // Step 3: Collect label groups
  const labelGroups = new Map<string, TextLayoutBlockInstance[]>();
  _collectLabelGroupsRecursive(instance, labelGroups);

  // Early return if no labels
  if (labelGroups.size === 0) {
    return { instance, elements: {}, fontSizes: {} };
  }

  // Step 4: Calculate font sizes
  const fontSizes = _calculateUnifiedFontSizes(labelGroups, dataMap);

  // Step 5: Create HTML elements
  const htmlElements = _createElementsWithFontSizes(labelGroups, dataMap, fontSizes);

  // Step 6: Apply positioning
  _measureAndPositionElements(instance, labelGroups, htmlElements, dataMap);

  // Step 7: Convert HTML elements to PPT elements
  const elements = _convertToPPTElements(htmlElements, labelGroups);

  return { instance, elements, fontSizes };
}

/**
 * Detects and normalizes data structure (flat vs nested).
 *
 * Flat structure: { label: [...], content: [...] }
 * Nested structure: { column1: [...], column2: [...] } with config.children
 *
 * Returns dataMap for tracking label->data associations.
 */
function _normalizeDataStructure(
  data: Record<string, string[]>,
  config: LayoutBlockConfig,
  bounds: Bounds
): { dataMap: Map<string, string[]>; processedData: any[]; instance?: LayoutBlockInstance } {
  const dataMap = new Map<string, string[]>();

  // Handle object data (label/value split or nested)
  if (config.childTemplate && !config.children) {
    // Flat with label/value split
    return _processFlatObjectData(data, dataMap);
  } else {
    // Nested structure - returns instance directly
    const result = _processNestedData(data, config, dataMap, bounds);
    return result;
  }
}

/**
 * Calculates unified font sizes for all label groups.
 * Also applies font size hierarchy (e.g., labels 1.2x larger than content).
 */
function _calculateUnifiedFontSizes(
  labelGroups: Map<string, TextLayoutBlockInstance[]>,
  dataMap: Map<string, string[]>
): Record<string, number> {
  const fontSizes: Record<string, number> = {};
  const minFontSize = DEFAULT_MIN_FONT_SIZE;
  const labelToValueRatio = DEFAULT_LABEL_TO_VALUE_RATIO;

  // Calculate font size for each label group
  for (const [label, instances] of labelGroups.entries()) {
    const labelData = dataMap.get(label) || [];
    if (labelData.length === 0 || instances.length === 0) continue;

    const result = _calculateFontSizeForLabel(label, instances, labelData);
    fontSizes[label] = Math.max(result.fontSize, minFontSize);
  }

  // Apply font size hierarchy
  _applyFontSizeHierarchy(fontSizes, labelToValueRatio, minFontSize);

  return fontSizes;
}

/**
 * Extract element creation with font sizes
 */
function _createElementsWithFontSizes(
  labelGroups: Map<string, TextLayoutBlockInstance[]>,
  dataMap: Map<string, string[]>,
  fontSizes: Record<string, number>
): Record<string, HTMLElement[]> {
  const allElements: Record<string, HTMLElement[]> = {};

  for (const [label, instances] of labelGroups.entries()) {
    const labelData = dataMap.get(label) || [];
    if (labelData.length === 0) continue;

    allElements[label] = labelData.map((item) => {
      return createHtmlElement(item, fontSizes[label], instances[0].text || {});
    });
  }

  return allElements;
}

/**
 * Extract flat object data processing
 */
function _processFlatObjectData(
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
function _processNestedData(
  data: Record<string, string[]>,
  config: LayoutBlockConfig,
  dataMap: Map<string, string[]>,
  bounds: Bounds
): { dataMap: Map<string, string[]>; processedData: any[]; instance: LayoutBlockInstance } {
  // Build tree with children having proper data distribution
  const instance = buildInstanceWithBounds(config, bounds, undefined);

  if (config.children && instance.children) {
    const childrenBounds = getChildrenMaxBounds(bounds, {
      distribution: config.layout?.distribution,
      childCount: config.children.length,
      orientation: config.layout?.orientation,
      gap: config.layout?.gap,
    });

    const dataArray = Array.isArray(data) ? data : Object.values(data);

    // Process children and collect data mapping
    const processedChildren = _processChildrenData(config.children, childrenBounds, dataArray, dataMap);

    // Assign processed children back to instance
    instance.children = processedChildren;
  }

  return { dataMap, processedData: Object.values(data), instance };
}

/**
 * Extract children data processing
 */
function _processChildrenData(
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
      children: childInstance,
    } as LayoutBlockInstance;
  });
}

/**
 * Extract font size calculation for a single label
 */
function _calculateFontSizeForLabel(
  label: string,
  instances: TextLayoutBlockInstance[],
  labelData: string[]
): { fontSize: number } {
  // Create HTML elements for font size calculation
  const elements = labelData.map((item) => {
    return createHtmlElement(item, 16, instances[0].text || {});
  });

  // Determine font size range based on label type
  const fontSizeRange = label === 'label' ? FONT_SIZE_RANGE_LABEL : FONT_SIZE_RANGE_CONTENT;

  // Calculate unified font size for this group
  return calculateUnifiedFontSizeForLabels(elements, instances, fontSizeRange);
}

/**
 * Enforces font size hierarchy: labels should be larger than content.
 * If labels are too small relative to content, shrinks content proportionally.
 */
function _applyFontSizeHierarchy(
  fontSizes: Record<string, number>,
  labelToValueRatio: number,
  minFontSize: number
): void {
  if (fontSizes['label'] && fontSizes['content']) {
    if (fontSizes['label'] <= fontSizes['content'] * labelToValueRatio) {
      fontSizes['content'] = Math.round(fontSizes['label'] / labelToValueRatio);
      fontSizes['content'] = Math.max(fontSizes['content'], minFontSize);
    }
  }
}

/**
 * Extract recursive label group collection
 */
function _collectLabelGroupsRecursive(
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
    container.children.forEach((child) => _collectLabelGroupsRecursive(child, groups));
  }
}

/**
 * Convert HTML elements to PPT elements
 */
function _convertToPPTElements(
  htmlElements: Record<string, HTMLElement[]>,
  labelGroups: Map<string, TextLayoutBlockInstance[]>
): Record<string, PPTElement[]> {
  const pptElements: Record<string, PPTElement[]> = {};

  for (const [label, elements] of Object.entries(htmlElements)) {
    const instances = labelGroups.get(label) || [];

    pptElements[label] = elements
      .map((htmlEl, index) => {
        const instance = instances[index];
        if (!instance) {
          throw new Error(`No instance found for label "${label}" at index ${index}`);
        }

        if (instance.type !== 'text') {
          return null;
        }

        return createTextPPTElement(htmlEl, instance);
      })
      .filter((el) => el !== null) as PPTElement[];
  }

  return pptElements;
}

/**
 * Measures actual element dimensions and positions them within their containers.
 * Recursively processes nested structures.
 *
 * For each parent with labeled children:
 * 1. Measure actual heights of HTML elements
 * 2. Use layoutItemsInBlock to position based on measurements
 * 3. Apply calculated bounds back to instances
 */
function _measureAndPositionElements(
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
      _measureAndPositionElements(child, labelGroups, allElements, dataMap);
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

      const measured = measureElement(elements[elementIndex], labeledChild as LayoutBlockInstance);

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
