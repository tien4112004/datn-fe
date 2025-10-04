import {
  type PPTElement,
  type PPTImageElement,
  type PPTTextElement,
  type PPTShapeElement,
  type SlideBackground,
  type SlideTheme,
  ShapePathFormulasKeys,
  type PPTLineElement,
} from '@/types/slides';
import {
  calculateLargestOptimalFontSize,
  applyFontSizeToElement,
  calculateFontSizeForAvailableSpace,
  applyFontSizeToElements,
} from './fontSizeCalculator';
import { createElement } from './htmlTextCreation';
import { measureElementForBlock, measureElementWithStyle, measureElement } from './elementMeasurement';
import type {
  ImageLayoutBlockInstance,
  Position,
  Size,
  Bounds,
  TextLayoutBlockInstance,
  LayoutBlockInstance,
  WrapConfig,
  SlideLayoutBlockConfig,
  LayoutBlockConfig,
  DistributionType,
  TemplateContainerConfig,
  SlideViewport,
  RelativePositioning,
} from './types';
import { getImageSize } from '../image';
import { SHAPE_PATH_FORMULAS } from '../../configs/shapes';

const slideWidth = 1000;
const slideHeight = 562.5;

const LayoutPrimitives = {
  getColumnsLayout(columnWidths: number[]): Bounds[] {
    // Validate percentages add up to 100
    const totalPercentage = columnWidths.reduce((sum, width) => sum + width, 0);
    if (Math.abs(totalPercentage - 100) > 0.1) {
      console.warn(`Column widths should add up to 100%, got ${totalPercentage}%`);
    }

    const columns: Bounds[] = [];
    let currentLeft = 0;

    columnWidths.forEach((widthPercentage) => {
      const columnWidth = (slideWidth * widthPercentage) / 100;

      columns.push({
        left: currentLeft,
        top: 0,
        width: columnWidth,
        height: slideHeight,
      });

      // Move to next column position
      currentLeft += columnWidth;
    });

    return columns;
  },

  calculateTitleLayout(title: string, container: TextLayoutBlockInstance) {
    // Create title element
    const titleElement = createElement(title, {
      fontSize: 32, // Initial size, will be optimized
      lineHeight: 1,
      fontFamily: container.text?.fontFamily || 'Arial',
      color: container.text?.color || '#000000',
    });

    // Calculate optimal font size using the actual element
    const titleFontSize = calculateLargestOptimalFontSize(
      titleElement,
      container.bounds.width,
      container.bounds.height,
      'title'
    );

    // Apply the calculated font size to the element
    applyFontSizeToElement(titleElement, titleFontSize, 1.2);

    // Measure the element with optimized font size
    const titleDimensions = measureElementWithStyle(titleElement, container);

    const horizontalPosition = this.getPosition(container.bounds, titleDimensions, {
      horizontalAlignment: container.horizontalAlignment,
    }).left;

    const titlePosition = {
      left: horizontalPosition,
      top: container.bounds.top,
    };

    return {
      titleElement,
      titleContent: titleElement.outerHTML,
      titleDimensions,
      titlePosition,
      titleFontSize,
    };
  },

  getPosition(
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
  },

  getChildrenMaxBounds(
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
      spacingBetweenItems = 0,
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
  },

  layoutItemsInBlock(itemDimensions: Size[], container: LayoutBlockInstance): Bounds[] {
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
        const actualSpacing = container.spacingBetweenItems || 10;
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
  },

  calculateUnifiedFontSizeForColumns(
    columnItemGroups: string[][],
    containers: TextLayoutBlockInstance[]
  ): { fontSize: number; lineHeight: number } {
    if (columnItemGroups.length === 0 || containers.length === 0) {
      return { fontSize: 16, lineHeight: 1.4 };
    }

    const fontFamily = containers[0].text?.fontFamily || 'Arial';
    const color = containers[0].text?.color || '#000000';

    // Calculate optimal font size for each column independently
    const columnFontSizes: { fontSize: number; lineHeight: number }[] = [];

    for (let i = 0; i < columnItemGroups.length; i++) {
      const items = columnItemGroups[i];
      const container = containers[i];

      // Create temporary elements for this column
      const tempElements = items.map((item) =>
        createElement(item, {
          fontSize: 20, // Initial size for optimization
          lineHeight: 1.4,
          fontFamily,
          color,
        })
      );

      // Calculate font size for this column
      const contentStyles = calculateFontSizeForAvailableSpace(
        tempElements,
        container.bounds.width,
        container.bounds.height
      );

      columnFontSizes.push({
        fontSize: contentStyles.fontSize,
        lineHeight: contentStyles.lineHeight,
      });
    }

    // Pick the smallest font size to ensure all columns fit
    const minFontSize = Math.min(...columnFontSizes.map((c) => c.fontSize));
    const correspondingLineHeight =
      columnFontSizes.find((c) => c.fontSize === minFontSize)?.lineHeight || 1.4;

    return {
      fontSize: minFontSize,
      lineHeight: correspondingLineHeight,
    };
  },

  async createElement(content: string, container: TextLayoutBlockInstance): Promise<PPTTextElement> {
    // Create initial text element with default styling
    const initialElement = createElement(content, {
      fontSize: 32, // Initial size for optimization
      lineHeight: 1.2,
      fontFamily: container.text?.fontFamily || 'Arial',
      color: container.text?.color || '#000000',
      textAlign: container.text?.textAlign || 'left',
      fontWeight: container.text?.fontWeight || 'normal',
    });

    // Calculate optimal font size for the content to fit within bounds
    const optimalFontSize = calculateLargestOptimalFontSize(
      initialElement,
      container.bounds.width,
      container.bounds.height,
      'content'
    );

    // Apply the calculated font size to the element
    applyFontSizeToElement(initialElement, optimalFontSize, 1.2);

    // Measure the element with optimized font size
    const dimensions = measureElementWithStyle(initialElement, container);

    // Calculate positioning within the container
    const position = this.getPosition(container.bounds, dimensions, {
      horizontalAlignment: container.horizontalAlignment,
      verticalAlignment: container.verticalAlignment,
    });

    // Create and return the PPT text element
    return {
      id: crypto.randomUUID(),
      type: 'text',
      content: initialElement.outerHTML,
      defaultFontName: container.text?.fontFamily || 'Arial',
      defaultColor: container.text?.color || '#000000',
      left: position.left,
      top: position.top,
      width: dimensions.width,
      height: dimensions.height,
      textType: 'content',
      outline: container.border
        ? {
            color: container.border.color,
            width: container.border.width,
            borderRadius: container.border.radius || '0',
          }
        : undefined,
      shadow: container.shadow,
    } as PPTTextElement;
  },

  async createItemElementsWithStyles(
    items: string[],
    container: TextLayoutBlockInstance
  ): Promise<PPTTextElement[]> {
    // Always optimize font size - create temporary elements to calculate optimal size
    const tempItemElements = items.map((item) =>
      createElement(item, {
        fontSize: 20, // Initial size for optimization
        lineHeight: 1.4,
        fontFamily: container.text?.fontFamily || 'Arial',
        color: container.text?.color || '#000000',
        textAlign: container.text?.textAlign || 'left',
      })
    );

    const contentStyles = calculateFontSizeForAvailableSpace(
      tempItemElements,
      container.bounds.width,
      container.bounds.height
    );

    const finalFontSize = contentStyles.fontSize;
    const finalLineHeight = contentStyles.lineHeight;

    // Apply calculated styles to temp elements for measurement
    applyFontSizeToElements(tempItemElements, contentStyles);

    // Calculate item styles with final font size
    const itemStyles = {
      fontSize: finalFontSize,
      lineHeight: finalLineHeight,
      fontFamily: container.text?.fontFamily || 'Arial',
      color: container.text?.color || '#000000',
      textAlign: container.text?.textAlign || 'left',
    };

    // Pre-calculate all item dimensions using the unified styles
    const itemContentsAndDimensions = items.map((item) => {
      const itemElement = createElement(item, {
        fontSize: itemStyles.fontSize,
        lineHeight: itemStyles.lineHeight,
        fontFamily: itemStyles.fontFamily,
        color: itemStyles.color,
        textAlign: itemStyles.textAlign,
      });
      const itemDimensions = measureElementForBlock(
        itemElement,
        container.bounds.width,
        container.bounds.height
      );
      return { content: itemElement.outerHTML, dimensions: itemDimensions };
    });

    // Calculate positions using the enhanced distribution logic
    const itemPositions = this.layoutItemsInBlock(
      itemContentsAndDimensions.map((item) => item.dimensions),
      container
    );

    // Create PPTTextElement objects
    return itemContentsAndDimensions.map((item, index) => {
      const position = itemPositions[index];

      return {
        id: crypto.randomUUID(),
        type: 'text',
        content: item.content,
        defaultFontName: itemStyles.fontFamily,
        defaultColor: itemStyles.color,
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
        textType: 'content',
      } as PPTTextElement;
    });
  },

  async createTextElementsWithUnifiedStyles(
    items: string[],
    container: TextLayoutBlockInstance,
    unifiedFontSize: { fontSize: number; lineHeight: number }
  ): Promise<PPTTextElement[]> {
    const finalFontSize = unifiedFontSize.fontSize;
    const finalLineHeight = unifiedFontSize.lineHeight;

    // Calculate item styles with unified font size
    const itemStyles = {
      fontSize: finalFontSize,
      lineHeight: finalLineHeight,
      fontFamily: container.text?.fontFamily || 'Arial',
      color: container.text?.color || '#000000',
    };

    // Pre-calculate all item dimensions using the unified styles
    const itemContentsAndDimensions = items.map((item) => {
      const itemElement = createElement(item, {
        fontSize: itemStyles.fontSize,
        lineHeight: itemStyles.lineHeight,
        fontFamily: itemStyles.fontFamily,
        color: itemStyles.color,
      });
      const itemDimensions = measureElementForBlock(
        itemElement,
        container.bounds.width,
        container.bounds.height
      );
      return { content: itemElement.outerHTML, dimensions: itemDimensions };
    });

    // Calculate positions using the enhanced distribution logic
    const itemPositions = this.layoutItemsInBlock(
      itemContentsAndDimensions.map((item) => item.dimensions),
      container
    );

    // Create PPTTextElement objects
    return itemContentsAndDimensions.map((item, index) => {
      const position = itemPositions[index];

      return {
        id: crypto.randomUUID(),
        type: 'text',
        content: item.content,
        defaultFontName: itemStyles.fontFamily,
        defaultColor: itemStyles.color,
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
        textType: 'content',
      } as PPTTextElement;
    });
  },

  async createImageElement(src: string, container: ImageLayoutBlockInstance): Promise<PPTImageElement> {
    const imageOriginalSize = await getImageSize(src);
    const imageRatio = imageOriginalSize.width / imageOriginalSize.height;

    const finalClip = {
      shape: 'rect',
      range: [
        [100 / (imageRatio + 1), 0],
        [100 - 100 / (imageRatio + 1), 100],
      ],
    };

    return {
      id: crypto.randomUUID(),
      type: 'image',
      src,
      fixedRatio: false,
      left: container.bounds.left,
      top: container.bounds.top,
      width: container.bounds.width,
      height: container.bounds.height,
      rotate: 0,
      clip: finalClip,
      outline: {
        color: container.border?.color || '#000000',
        width: container.border?.width || 0,
      },
      radius: container.border?.radius || '0',
    } as PPTImageElement;
  },

  createTitleLine(titleDimensions: Bounds, theme: SlideTheme) {
    return {
      id: crypto.randomUUID(),
      type: 'line',
      style: 'solid',
      left: titleDimensions.left,
      top: titleDimensions.top + titleDimensions.height + 10,
      start: [0, 0],
      end: [titleDimensions.width, 0],
      width: 2,
      color: theme.themeColors[0],
      points: ['', ''],
    } as PPTLineElement;
  },

  createCard(container: LayoutBlockInstance): PPTShapeElement {
    const formula = SHAPE_PATH_FORMULAS[ShapePathFormulasKeys.ROUND_RECT];
    const radiusMultiplier = container.border?.radius
      ? container.border.radius / Math.min(container.bounds.width, container.bounds.height)
      : 0.125;
    const path = formula.formula(container.bounds.width, container.bounds.height, [radiusMultiplier]);

    return {
      id: crypto.randomUUID(),
      type: 'shape',
      shapeType: 'roundedRect',
      left: container.bounds.left,
      top: container.bounds.top,
      width: container.bounds.width,
      height: container.bounds.height,
      viewBox: [container.bounds.width, container.bounds.height],
      path,
      fixedRatio: false,
      rotate: 0,
      fill: 'transparent',
      outline: container.border
        ? {
            color: container.border.color,
            width: container.border.width,
          }
        : undefined,
      radius: container.border?.radius || 0,
    } as PPTShapeElement;
  },

  createTextPPTElement(content: HTMLElement, block: TextLayoutBlockInstance): PPTTextElement {
    return {
      id: crypto.randomUUID(),
      type: 'text',
      content: content.outerHTML,
      defaultFontName: block.text?.fontFamily || 'Arial',
      defaultColor: block.text?.color || '#000000',
      left: block.bounds.left,
      top: block.bounds.top,
      width: block.bounds.width,
      height: block.bounds.height,
      textType: 'title',
      outline: {
        color: block.border?.color || '#000000',
        width: block.border?.width || 0,
        borderRadius: block.border?.radius || '0',
      },
      shadow: block.shadow,
    } as PPTTextElement;
  },

  recursivelyPreprocessDescendants(container: LayoutBlockInstance): void {
    if (!container.children || container.children.length === 0) return;

    const items = this.getChildrenMaxBounds(container.bounds, {
      distribution: container.distribution,
      childCount: container.children.length,
      orientation: container.orientation,
    });

    container.children.forEach((child, index) => {
      if (!items[index]) return;

      container.children![index] = { ...child, bounds: items[index] } as TextLayoutBlockInstance;

      if (child.children && child.children.length > 0) {
        this.recursivelyPreprocessDescendants(container.children![index]);
      }
    });
  },

  recursivelyGetAllLabelInstances(container: LayoutBlockInstance, label: string): TextLayoutBlockInstance[] {
    let labels: LayoutBlockInstance[] = [];

    if (!container.children || container.children.length === 0) return labels;

    for (const child of container.children) {
      if (child.label === label) {
        labels.push(child);
      }

      if (child.children && child.children.length > 0) {
        labels = labels.concat(this.recursivelyGetAllLabelInstances(child, label));
      }
    }

    return labels;
  },

  /**
   * Measure elements and apply final positioning
   */
  measureAndPositionElements(
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
        this.measureAndPositionElements(child, labelGroups, allElements, dataMap);
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
      const positionedBounds = this.layoutItemsInBlock(dimensions, child);

      // Apply positioned bounds
      labeledChildren.forEach((labeledChild, idx) => {
        labeledChild.bounds = positionedBounds[idx];
      });
    });
  },

  /**
   * Helper to calculate unified font size for a group of labeled elements
   */
  calculateUnifiedFontSizeForLabels(
    elements: HTMLElement[],
    containers: TextLayoutBlockInstance[],
    type: 'title' | 'content' | 'label' = 'content'
  ): { fontSize: number; lineHeight: number } {
    if (elements.length === 0 || containers.length === 0 || elements.length !== containers.length) {
      return { fontSize: 16, lineHeight: 1.4 };
    }

    // Calculate optimal font size for each element independently
    const fontSizes: number[] = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const container = containers[i];

      const optimalFontSize = calculateLargestOptimalFontSize(
        element,
        container.bounds.width,
        container.bounds.height,
        type
      );

      fontSizes.push(optimalFontSize);
    }

    // Take minimum size (most constrained)
    const minFontSize = Math.min(...fontSizes);
    const lineHeight = type === 'label' ? 1.2 : 1.4;

    return {
      fontSize: minFontSize,
      lineHeight,
    };
  },

  /**
   * Expands a childTemplate into N child instances with calculated bounds
   * @param templateContainer - Container config with childTemplate
   * @param parentBounds - Bounds of parent container
   * @param data - Array of data items to map to children (length determines count if auto)
   */
  buildChildrenFromChildTemplate(
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
    const wrapConfig = childTemplate.wrap || {
      enabled: true,
      maxItemsPerLine: 50, // Effectively infinite for non-wrap
    };

    const wrapLayout = this.calculateWrapLayout(
      count,
      parentBounds,
      wrapConfig,
      templateContainer.orientation || 'vertical',
      templateContainer.spacingBetweenItems || 0,
      wrapConfig.alternating
    );

    // Create instances with calculated bounds, passing corresponding data item
    const children: LayoutBlockInstance[] = [];
    for (let i = 0; i < count; i++) {
      const itemData = data[i]; // Could be object, string, number, etc.
      const instance = this.buildInstanceWithBounds(
        childTemplate.structure,
        wrapLayout.itemBounds[i],
        itemData ? [itemData] : undefined // Wrap in array for nested templates,
      );
      children.push(instance);
    }

    return children;
  },

  /**
   * Recursively builds layout instance tree with calculated bounds for all descendants
   * @param config - Layout block configuration
   * @param bounds - Bounds for this instance
   * @param data - Data array for child population (undefined for leaf nodes)
   */
  buildInstanceWithBounds(config: SlideLayoutBlockConfig, bounds: Bounds, data?: any[]): LayoutBlockInstance {
    // Create base instance with assigned bounds
    const instance: LayoutBlockInstance = {
      id: config.id,
      bounds,
      label: config.label,
      padding: config.padding || { top: 0, bottom: 0, left: 0, right: 0 },
      border: config.border,
      shadow: config.shadow,
      verticalAlignment: config.verticalAlignment,
      horizontalAlignment: config.horizontalAlignment,
      distribution: config.distribution,
      orientation: config.orientation,
      spacingBetweenItems: config.spacingBetweenItems,
    };

    // Add type-specific properties
    if ('text' in config) {
      (instance as TextLayoutBlockInstance).text = config.text;
      (instance as TextLayoutBlockInstance).background = config.background;
    }

    // Handle children - either static or from template
    if (config.children) {
      // Static children - calculate bounds using getChildrenMaxBounds
      const childrenBounds = this.getChildrenMaxBounds(bounds, {
        distribution: config.distribution,
        childCount: config.children.length,
        orientation: config.orientation,
        spacingBetweenItems: config.spacingBetweenItems,
      });

      // Pass same data to all static children
      instance.children = config.children.map((childConfig, index) =>
        this.buildInstanceWithBounds(childConfig, childrenBounds[index], data)
      );
    } else if (config.childTemplate) {
      // Dynamic children from template - expand with data mapping
      instance.children = this.buildChildrenFromChildTemplate(config, bounds, data || []);
    }

    return instance;
  },

  calculateWrapLayout(
    itemCount: number,
    containerBounds: Bounds,
    wrapConfig: WrapConfig,
    orientation: 'horizontal' | 'vertical',
    spacingBetweenItems: number,
    alternating?: boolean
  ): {
    lines: number; // Number of rows/columns
    itemsPerLine: number[]; // Items in each line [4, 3] for 7 items in 2 rows
    itemBounds: Bounds[]; // Bounds for each item
  } {
    if (!wrapConfig || !wrapConfig.enabled) {
      return {
        lines: 1,
        itemsPerLine: [itemCount],
        itemBounds: [],
      };
    }

    let maxPerLine: number = wrapConfig.maxItemsPerLine || itemCount;

    const distributions = this.distributeItems(itemCount, maxPerLine, wrapConfig.distribution || 'balanced');

    // Handle orientation = horizontal first
    const lines = distributions.length;
    const itemsPerLine = distributions;
    let lineBounds: Bounds[] = [];
    const lineSpacing = wrapConfig.lineSpacing || 0;
    let itemBounds: Bounds[] = [];

    if (orientation === 'horizontal') {
      lineBounds = distributions.map((count, lineIndex) => {
        const lineHeight = (containerBounds.height - (lines - 1) * lineSpacing) / lines;
        return {
          left: containerBounds.left,
          top: containerBounds.top + lineIndex * (lineHeight + lineSpacing),
          width: containerBounds.width,
          height: lineHeight,
        };
      });

      // Calculate item bounds within each line
      itemBounds = lineBounds
        .map((line, lineIndex) => {
          const count = distributions[lineIndex];
          const totalSpacing = (count - 1) * spacingBetweenItems;
          let itemWidth = (containerBounds.width - totalSpacing) / count;

          return Array.from({ length: count }, (_, itemIndex) => {
            let leftStart = line.left + itemIndex * (itemWidth + spacingBetweenItems);
            if (alternating && lineIndex % 2 === 1) {
              leftStart += spacingBetweenItems;
              itemWidth -= spacingBetweenItems;
            }
            return {
              left: leftStart,
              top: line.top,
              width: itemWidth,
              height: line.height,
            };
          });
        })
        .flat();
    } else {
      // Vertical orientation (columns)
      lineBounds = distributions.map((count, lineIndex) => {
        const lineWidth = (containerBounds.width - (lines - 1) * lineSpacing) / lines;
        return {
          left: containerBounds.left + lineIndex * (lineWidth + lineSpacing),
          top: containerBounds.top,
          width: lineWidth,
          height: containerBounds.height,
        };
      });

      // Calculate item bounds within each column
      itemBounds = lineBounds
        .map((line, lineIndex) => {
          const count = distributions[lineIndex];
          const totalSpacing = (count - 1) * spacingBetweenItems;
          let itemHeight = (containerBounds.height - totalSpacing) / count;

          return Array.from({ length: count }, (_, itemIndex) => {
            let topStart = line.top + itemIndex * (itemHeight + spacingBetweenItems);
            if (alternating && lineIndex % 2 === 1) {
              topStart += spacingBetweenItems;
              itemHeight -= spacingBetweenItems;
            }
            return {
              left: line.left,
              top: topStart,
              width: line.width,
              height: itemHeight,
            };
          });
        })
        .flat();
    }

    return {
      lines,
      itemsPerLine,
      itemBounds,
    };
  },

  distributeItems(
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
  },

  processBackground(theme: SlideTheme): SlideBackground {
    if (typeof theme.backgroundColor === 'string') {
      return { type: 'solid', color: theme.backgroundColor };
    } else {
      return {
        type: 'gradient',
        gradient: {
          type: theme.backgroundColor.type,
          colors: theme.backgroundColor.colors,
          rotate: theme.backgroundColor.rotate || 0,
        },
      };
    }
  },

  /**
   * Resolve container positions with priority:
   * 1. If bounds exists, use it (absolute positioning)
   * 2. Otherwise use positioning (relative positioning)
   */
  resolveContainerPositions(
    containers: Record<string, TemplateContainerConfig>,
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
            resolved[id] = this.calculateBoundsFromPositioning(
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
            resolved[id] = this.calculateBoundsFromPositioning(pos, resolved[parentId], viewport);
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
  },

  calculateBoundsFromPositioning(
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
  },
};

export default LayoutPrimitives;
