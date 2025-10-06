import type { PPTImageElement, SlideTheme, PPTElement } from '@/types/slides';
import type {
  TemplateContainerConfig,
  ImageLayoutBlockInstance,
  TextLayoutBlockInstance,
  Bounds,
  LayoutBlockInstance,
  LayoutBlockConfig,
  ConvergenceOptions,
} from '../types';
import LayoutPrimitives from '.';
import { createHtmlElement } from './elementCreators';

const LayoutProBuilder = {
  async buildImageElement(src: string, container: TemplateContainerConfig): Promise<PPTImageElement> {
    const imageInstance = {
      ...container,
      bounds: container.bounds,
    } as ImageLayoutBlockInstance;

    return await LayoutPrimitives.createImageElement(src, imageInstance);
  },

  buildCards(instance: LayoutBlockInstance): PPTElement[] {
    const list = LayoutPrimitives.getAllDescendantInstances(instance).map((inst) => {
      if (!inst.border) return null;
      return LayoutPrimitives.createCard(inst as LayoutBlockInstance);
    });
    return list.filter((el) => el !== null);
  },

  buildTitle(title: string, config: TemplateContainerConfig, theme: SlideTheme): PPTElement[] {
    const titleInstance = {
      ...config,
      bounds: config.bounds,
    } as TextLayoutBlockInstance;

    const titleElement = LayoutPrimitives.createTextElement(title, titleInstance, {
      minSize: 18,
      maxSize: 48,
    });

    return [
      titleElement,
      LayoutPrimitives.createTitleLine(
        {
          width: titleElement.width,
          height: titleElement.height,
          left: titleElement.left,
          top: titleElement.top,
        } as Bounds,
        theme
      ),
    ];
  },

  /**
   * Build layout with unified font sizing (single pass, no redundant iteration)
   * Supports both flat and nested data structures
   * @param config - Content container configuration
   * @param bounds - Fixed content bounds (from parent allocation)
   * @param data - Data items as object mapping labels to string arrays
   * @param theme - Slide theme for creating elements
   * @param options - Font sizing options
   * @returns Layout instance with unified font sizes organized by label
   */
  buildLayoutWithUnifiedFontSizing(
    config: LayoutBlockConfig,
    bounds: Bounds,
    data: Record<string, string[]>,
    options?: ConvergenceOptions
  ): {
    instance: LayoutBlockInstance;
    elements: Record<string, HTMLElement[]>;
    fontSizes: Record<string, number>;
  } {
    // Step 1: Process and normalize data
    const {
      dataMap,
      processedData,
      instance: prebuiltInstance,
    } = this._normalizeDataStructure(data, config, bounds);

    // Step 2: Build layout tree (skip if already built for nested structures)
    const instance =
      prebuiltInstance || LayoutPrimitives.buildInstanceWithBounds(config, bounds, processedData);

    // Step 3: Collect label groups
    const labelGroups = this._collectLabelGroups(instance);

    // Early return if no labels
    if (labelGroups.size === 0) {
      return { instance, elements: {}, fontSizes: {} };
    }

    // Step 4: Calculate font sizes
    const fontSizes = this._calculateUnifiedFontSizes(labelGroups, dataMap, options);

    // Step 5: Create elements
    const elements = this._createElementsWithFontSizes(labelGroups, dataMap, fontSizes);

    // Step 6: Apply positioning
    this._applyPositioning(instance, labelGroups, elements, dataMap);

    return { instance, elements, fontSizes };
  },

  /**
   * Extract data structure detection and normalization
   */
  _normalizeDataStructure(
    data: Record<string, string[]>,
    config: LayoutBlockConfig,
    bounds: Bounds
  ): { dataMap: Map<string, string[]>; processedData: any[]; instance?: LayoutBlockInstance } {
    const dataMap = new Map<string, string[]>();

    // Handle object data (label/value split or nested)
    if (config.childTemplate && !config.children) {
      // Flat with label/value split
      return this._processFlatObjectData(data, dataMap);
    } else {
      // Nested structure - returns instance directly
      const result = this._processNestedData(data, config, dataMap, bounds);
      return result;
    }
  },

  /**
   * Extract label group collection
   */
  _collectLabelGroups(container: LayoutBlockInstance): Map<string, TextLayoutBlockInstance[]> {
    const groups = new Map<string, TextLayoutBlockInstance[]>();
    this._collectLabelGroupsRecursive(container, groups);
    return groups;
  },

  /**
   * Extract font size calculation
   */
  _calculateUnifiedFontSizes(
    labelGroups: Map<string, TextLayoutBlockInstance[]>,
    dataMap: Map<string, string[]>,
    options?: ConvergenceOptions
  ): Record<string, number> {
    const fontSizes: Record<string, number> = {};
    const minFontSize = options?.minFontSize ?? 8;
    const labelToValueRatio = options?.labelToValueRatio ?? 1.2;

    // Calculate font size for each label group
    for (const [label, instances] of labelGroups.entries()) {
      const labelData = dataMap.get(label) || [];
      if (labelData.length === 0 || instances.length === 0) continue;

      const result = this._calculateFontSizeForLabel(label, instances, labelData);
      fontSizes[label] = Math.max(result.fontSize, minFontSize);
    }

    // Apply font size hierarchy
    this._applyFontSizeHierarchy(fontSizes, labelToValueRatio, minFontSize);

    return fontSizes;
  },

  /**
   * Extract element creation with font sizes
   */
  _createElementsWithFontSizes(
    labelGroups: Map<string, TextLayoutBlockInstance[]>,
    dataMap: Map<string, string[]>,
    fontSizes: Record<string, number>
  ): Record<string, HTMLElement[]> {
    const allElements: Record<string, HTMLElement[]> = {};

    for (const [label, instances] of labelGroups.entries()) {
      const labelData = dataMap.get(label) || [];
      if (labelData.length === 0) continue;

      allElements[label] = labelData.map((item) => {
        return createHtmlElement(item, {
          fontSize: fontSizes[label],
          ...instances[0].text,
        });
      });
    }

    return allElements;
  },

  /**
   * Extract positioning application
   */
  _applyPositioning(
    instance: LayoutBlockInstance,
    labelGroups: Map<string, TextLayoutBlockInstance[]>,
    elements: Record<string, HTMLElement[]>,
    dataMap: Map<string, any[]>
  ): void {
    LayoutPrimitives.measureAndPositionElements(instance, labelGroups, elements, dataMap);
  },

  /**
   * Extract flat object data processing
   */
  _processFlatObjectData(
    data: Record<string, string[]>,
    dataMap: Map<string, string[]>
  ): { dataMap: Map<string, string[]>; processedData: any[] } {
    for (const [key, values] of Object.entries(data)) {
      dataMap.set(key, values);
    }
    const processedData = Object.values(data)[0] || [];
    return { dataMap, processedData };
  },

  /**
   * Extract nested data processing
   */
  _processNestedData(
    data: Record<string, string[]>,
    config: LayoutBlockConfig,
    dataMap: Map<string, string[]>,
    bounds: Bounds
  ): { dataMap: Map<string, string[]>; processedData: any[]; instance: LayoutBlockInstance } {
    // Build tree with children having proper data distribution
    const instance = LayoutPrimitives.buildInstanceWithBounds(config, bounds, undefined);

    if (config.children && instance.children) {
      const childrenBounds = LayoutPrimitives.getChildrenMaxBounds(bounds, {
        distribution: config.layout?.distribution,
        childCount: config.children.length,
        orientation: config.layout?.orientation,
        gap: config.layout?.gap,
      });

      const dataArray = Array.isArray(data) ? data : Object.values(data);

      // Process children and collect data mapping
      const processedChildren = this._processChildrenData(
        config.children,
        childrenBounds,
        dataArray,
        dataMap
      );

      // Assign processed children back to instance
      instance.children = processedChildren;
    }

    return { dataMap, processedData: Object.values(data), instance };
  },

  /**
   * Extract children data processing
   */
  _processChildrenData(
    children: LayoutBlockConfig[],
    childrenBounds: Bounds[],
    dataArray: any[],
    dataMap: Map<string, string[]>
  ): LayoutBlockInstance[] {
    return children.map((childConfig, index) => {
      const childData = dataArray[index] || [];
      const childInstance = LayoutPrimitives.buildChildrenFromChildTemplate(
        childConfig,
        childrenBounds[index],
        childData
      );

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
  },

  /**
   * Extract font size calculation for a single label
   */
  _calculateFontSizeForLabel(
    label: string,
    instances: TextLayoutBlockInstance[],
    labelData: string[]
  ): { fontSize: number } {
    // Create HTML elements for font size calculation
    const elements = labelData.map((item) => {
      return createHtmlElement(item, {
        fontSize: 16,
        ...instances[0].text,
      });
    });

    // Determine font size range based on label type
    const fontSizeRange = label === 'label' ? { minSize: 10, maxSize: 24 } : { minSize: 12, maxSize: 28 };

    // Calculate unified font size for this group
    return LayoutPrimitives.calculateUnifiedFontSizeForLabels(elements, instances, fontSizeRange);
  },

  /**
   * Extract font size hierarchy application
   */
  _applyFontSizeHierarchy(
    fontSizes: Record<string, number>,
    labelToValueRatio: number,
    minFontSize: number
  ): void {
    if (fontSizes['label'] && fontSizes['content']) {
      if (fontSizes['label'] <= fontSizes['content'] * labelToValueRatio) {
        fontSizes['content'] = fontSizes['label'] / labelToValueRatio;
        fontSizes['content'] = Math.max(fontSizes['content'], minFontSize);
      }
    }
  },

  /**
   * Extract recursive label group collection
   */
  _collectLabelGroupsRecursive(
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
      container.children.forEach((child) => this._collectLabelGroupsRecursive(child, groups));
    }
  },
};

export default LayoutProBuilder;
