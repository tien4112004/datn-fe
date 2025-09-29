import type { PPTImageElement, PPTTextElement, SlideTheme } from '@/types/slides';
import {
  calculateLargestOptimalFontSize,
  applyFontSizeToElement,
  calculateFontSizeForAvailableSpace,
  applyFontSizeToElements,
} from './fontSizeCalculator';
import { createItemElement, createTitleElement, createLabelElement } from './htmlTextCreation';
import type { LayoutBlock } from './slideLayout';
import { measureElementForBlock, measureElementWithStyle, measureElement } from './elementMeasurement';
import type {
  ImageLayoutBlockInstance,
  Position,
  Size,
  Bounds,
  TextLayoutBlockInstance,
  LayoutBlockInstance,
} from './types';
import { getImageSize } from '../image';
import { calculateRowDistribution } from './graphic';

const slideWidth = 1000;
const slideHeight = 562.5;
const LayoutPrimitives = {
  getColumnsLayout(columnWidths: number[]): LayoutBlock[] {
    // Validate percentages add up to 100
    const totalPercentage = columnWidths.reduce((sum, width) => sum + width, 0);
    if (Math.abs(totalPercentage - 100) > 0.1) {
      console.warn(`Column widths should add up to 100%, got ${totalPercentage}%`);
    }

    const columns: LayoutBlock[] = [];
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
    const titleElement = createTitleElement({
      content: title,
      fontSize: 32, // Initial size, will be optimized
      lineHeight: 1,
      fontFamily: container.text?.fontFamily || 'Arial',
      color: container.text?.color || '#000000',
    });

    // Calculate optimal font size using the actual element
    const titleFontSize = calculateLargestOptimalFontSize(
      titleElement,
      container.width,
      container.height,
      'title'
    );

    // Apply the calculated font size to the element
    applyFontSizeToElement(titleElement, titleFontSize, 1.2);

    // Measure the element with optimized font size
    const titleDimensions = measureElementWithStyle(titleElement, container);

    const horizontalPosition = this.getPosition(container, titleDimensions, {
      horizontalAlignment: container.horizontalAlignment,
    }).left;

    const titlePosition = {
      left: horizontalPosition,
      top: container.top,
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
    container: LayoutBlock,
    itemDimensions: Size,
    options: {
      horizontalAlignment?: 'left' | 'center' | 'right';
      verticalAlignment?: 'top' | 'center' | 'bottom';
    }
  ): Position {
    let left = container.left;
    let top = container.top;

    // Apply horizontal alignment
    if (options.horizontalAlignment === 'center') {
      left = container.left + (container.width - itemDimensions.width) / 2;
    } else if (options.horizontalAlignment === 'right') {
      left = container.left + container.width - itemDimensions.width;
    }

    // Apply vertical alignment
    if (options.verticalAlignment === 'center') {
      top = container.top + (container.height - itemDimensions.height) / 2;
    } else if (options.verticalAlignment === 'bottom') {
      top = container.top + container.height - itemDimensions.height;
    }

    return { left, top };
  },

  getChildrenMaxBounds(container: LayoutBlockInstance): Bounds[] {
    if (container.distribution !== 'equal') {
      console.warn(`getChildrenMaxBounds only supports 'equal' distribution currently.`);
    }

    if (!container.children || container.children.length === 0) {
      return [];
    }

    const positions: Bounds[] = [];

    if (container.orientation === 'horizontal') {
      // Horizontal layout
      const itemWidth = container.width / container.children.length;
      for (let i = 0; i < container.children.length; i++) {
        positions.push({
          left: container.left + i * itemWidth,
          top: container.top,
          width: itemWidth,
          height: container.height,
        });
      }
    } else {
      // Vertical layout (default)
      const itemHeight = container.height / container.children.length;
      for (let i = 0; i < container.children.length; i++) {
        positions.push({
          left: container.left,
          top: container.top + i * itemHeight,
          width: container.width,
          height: itemHeight,
        });
      }
    }

    return positions;
  },

  layoutItemsInBlock(itemDimensions: Size[], container: LayoutBlockInstance): Bounds[] {
    const distribution = container.distribution || 'equal';
    const alignment = container.verticalAlignment || 'top';

    const totalItemsHeight = itemDimensions.reduce((sum, dim) => sum + dim.height, 0);
    const availableHeight = container.height - (container.padding.top || 0) - (container.padding.bottom || 0);

    let positions: Bounds[] = [];
    let startY = container.top + (container.padding.top || 0);

    switch (distribution) {
      case 'space-between': {
        // Space between: distribute extra space evenly between items
        if (itemDimensions.length === 1) {
          // Single item: center it
          const centerY = startY + (availableHeight - itemDimensions[0].height) / 2;
          positions = [
            {
              top: centerY,
              left: container.left + (container.padding.left || 0),
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
              left: container.left + (container.padding.left || 0),
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
            left: container.left + (container.padding.left || 0),
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
            left: container.left + (container.padding.left || 0),
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
        createItemElement({
          content: item,
          fontSize: 20, // Initial size for optimization
          lineHeight: 1.4,
          fontFamily,
          color,
        })
      );

      // Calculate font size for this column
      const contentStyles = calculateFontSizeForAvailableSpace(
        tempElements,
        container.width,
        container.height
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

  async createItemElementsWithStyles(
    items: string[],
    container: TextLayoutBlockInstance
  ): Promise<PPTTextElement[]> {
    // Always optimize font size - create temporary elements to calculate optimal size
    const tempItemElements = items.map((item) =>
      createItemElement({
        content: item,
        fontSize: 20, // Initial size for optimization
        lineHeight: 1.4,
        fontFamily: container.text?.fontFamily || 'Arial',
        color: container.text?.color || '#000000',
      })
    );

    const contentStyles = calculateFontSizeForAvailableSpace(
      tempItemElements,
      container.width,
      container.height
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
    };

    // Pre-calculate all item dimensions using the unified styles
    const itemContentsAndDimensions = items.map((item) => {
      const itemElement = createItemElement({
        content: item,
        fontSize: itemStyles.fontSize,
        lineHeight: itemStyles.lineHeight,
        fontFamily: itemStyles.fontFamily,
        color: itemStyles.color,
      });
      const itemDimensions = measureElementForBlock(itemElement, container.width, container.height);
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

  async createItemElementsWithUnifiedStyles(
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
      const itemElement = createItemElement({
        content: item,
        fontSize: itemStyles.fontSize,
        lineHeight: itemStyles.lineHeight,
        fontFamily: itemStyles.fontFamily,
        color: itemStyles.color,
      });
      const itemDimensions = measureElementForBlock(itemElement, container.width, container.height);
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
        id: generateUniqueId(),
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
      left: container.left,
      top: container.top,
      width: container.width,
      height: container.height,
      rotate: 0,
      clip: finalClip,
      outline: {
        color: container.border?.color || '#000000',
        width: container.border?.width || 0,
      },
      radius: container.border?.radius || '0',
    } as PPTImageElement;
  },

  createTitlePPTElement(
    content: string,
    position: { left: number; top: number },
    dimensions: { width: number; height: number },
    block: TextLayoutBlockInstance
  ): PPTTextElement {
    return {
      id: crypto.randomUUID(),
      type: 'text',
      content,
      defaultFontName: block.text?.fontFamily || 'Arial',
      defaultColor: block.text?.color || '#000000',
      left: position.left,
      top: position.top,
      width: dimensions.width,
      height: dimensions.height,
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
    const items = this.getChildrenMaxBounds(container);

    container.children?.forEach((child, index) => {
      if (!items[index]) return;

      container.children![index] = { ...child, ...items[index] } as TextLayoutBlockInstance;

      if (child.children && child.children.length > 0) {
        this.recursivelyPreprocessDescendants(container.children![index]);
      }
    });
  },

  // Horizontal List Layout Methods
  calculateHorizontalLayout(
    itemCount: number,
    contentContainer: TextLayoutBlockInstance
  ): {
    topRowItems: number;
    bottomRowItems: number;
    columnWidth: number;
    rowHeight: number;
    hasBottomRow: boolean;
    spacing: number;
  } {
    const { topRowItems, bottomRowItems } = calculateRowDistribution(itemCount);
    const maxItemsPerRow = Math.max(topRowItems, bottomRowItems || 0);

    return {
      topRowItems,
      bottomRowItems,
      columnWidth: contentContainer.width / maxItemsPerRow,
      rowHeight: bottomRowItems > 0 ? contentContainer.height / 2 : contentContainer.height,
      hasBottomRow: bottomRowItems > 0,
      spacing: contentContainer.spacingBetweenItems || 50,
    };
  },

  async createHorizontalItemPairs(
    items: { label: string; content: string }[],
    layoutInfo: {
      topRowItems: number;
      bottomRowItems: number;
      columnWidth: number;
      rowHeight: number;
      hasBottomRow: boolean;
      spacing: number;
    },
    theme: SlideTheme
  ): Promise<
    {
      labelElement: HTMLElement;
      contentElement: HTMLElement;
      labelDimensions: Size;
      contentDimensions: Size;
      totalHeight: number;
    }[]
  > {
    const LABEL_CONTENT_SPACING = 15;
    const availableWidth = layoutInfo.columnWidth - 20; // padding
    const availableHeight = layoutInfo.rowHeight;

    const allElements = items.map((item) => ({
      labelElement: createLabelElement({
        content: item.label,
        fontSize: 20,
        lineHeight: 1.2,
        fontFamily: theme.fontName,
        color: theme.fontColor,
      }),
      contentElement: createItemElement({
        content: item.content,
        fontSize: 16,
        lineHeight: 1.4,
        fontFamily: theme.fontName,
        color: theme.fontColor,
      }),
    }));

    let optimalLabelFontSize = 20;
    for (const { labelElement } of allElements) {
      const labelFontSize = calculateLargestOptimalFontSize(
        labelElement,
        availableWidth,
        availableHeight * 0.4,
        'label'
      );
      optimalLabelFontSize = Math.min(optimalLabelFontSize, labelFontSize);
    }

    let optimalContentFontSize = 16;
    for (const { contentElement } of allElements) {
      const contentFontSize = calculateLargestOptimalFontSize(
        contentElement,
        availableWidth,
        availableHeight * 0.6,
        'content'
      );
      optimalContentFontSize = Math.min(optimalContentFontSize, contentFontSize);
    }

    return allElements.map(({ labelElement, contentElement }) => {
      applyFontSizeToElement(labelElement, optimalLabelFontSize, 1.2);
      applyFontSizeToElement(contentElement, optimalContentFontSize, 1.4);

      const labelDimensions = measureElement(labelElement, {
        maxWidth: availableWidth,
        maxHeight: availableHeight * 0.4,
      });
      const contentDimensions = measureElement(contentElement, {
        maxWidth: availableWidth,
        maxHeight: availableHeight * 0.6,
      });

      return {
        labelElement,
        contentElement,
        labelDimensions,
        contentDimensions,
        totalHeight: labelDimensions.height + contentDimensions.height + LABEL_CONTENT_SPACING,
      };
    });
  },

  async positionHorizontalElements(
    pairs: {
      labelElement: HTMLElement;
      contentElement: HTMLElement;
      labelDimensions: Size;
      contentDimensions: Size;
      totalHeight: number;
    }[],
    layoutInfo: {
      topRowItems: number;
      bottomRowItems: number;
      columnWidth: number;
      rowHeight: number;
      hasBottomRow: boolean;
      spacing: number;
    },
    contentContainer: TextLayoutBlockInstance,
    theme: SlideTheme
  ): Promise<PPTTextElement[]> {
    const elements: PPTTextElement[] = [];
    const LABEL_CONTENT_SPACING = 15;

    const topRowPairs = pairs.slice(0, layoutInfo.topRowItems);
    const bottomRowPairs = layoutInfo.hasBottomRow ? pairs.slice(layoutInfo.topRowItems) : [];

    const maxTopRowLabelHeight = Math.max(...topRowPairs.map((p) => p.labelDimensions.height));
    const maxTopRowContentHeight = Math.max(...topRowPairs.map((p) => p.contentDimensions.height));

    const maxBottomRowLabelHeight =
      bottomRowPairs.length > 0 ? Math.max(...bottomRowPairs.map((p) => p.labelDimensions.height)) : 0;
    const maxBottomRowContentHeight =
      bottomRowPairs.length > 0 ? Math.max(...bottomRowPairs.map((p) => p.contentDimensions.height)) : 0;

    const topRowY = contentContainer.top;
    const bottomRowY = layoutInfo.hasBottomRow
      ? contentContainer.top +
        maxTopRowLabelHeight +
        LABEL_CONTENT_SPACING +
        maxTopRowContentHeight +
        layoutInfo.spacing
      : 0;

    for (let i = 0; i < layoutInfo.topRowItems; i++) {
      const pair = pairs[i];
      const columnX = contentContainer.left + i * layoutInfo.columnWidth;
      const centerX = columnX + layoutInfo.columnWidth / 2;

      elements.push({
        id: crypto.randomUUID(),
        type: 'text',
        content: pair.labelElement.outerHTML,
        defaultFontName: theme.fontName,
        defaultColor: theme.fontColor,
        left: centerX - pair.labelDimensions.width / 2,
        top: topRowY,
        width: pair.labelDimensions.width,
        height: pair.labelDimensions.height,
      } as PPTTextElement);

      elements.push({
        id: crypto.randomUUID(),
        type: 'text',
        content: pair.contentElement.outerHTML,
        defaultFontName: theme.fontName,
        defaultColor: theme.fontColor,
        left: centerX - pair.contentDimensions.width / 2,
        top: topRowY + maxTopRowLabelHeight + LABEL_CONTENT_SPACING,
        width: pair.contentDimensions.width,
        height: pair.contentDimensions.height,
      } as PPTTextElement);
    }

    if (layoutInfo.hasBottomRow) {
      for (let i = 0; i < layoutInfo.bottomRowItems; i++) {
        const pairIndex = layoutInfo.topRowItems + i;
        const pair = pairs[pairIndex];
        const columnX = contentContainer.left + i * layoutInfo.columnWidth;
        const centerX = columnX + layoutInfo.columnWidth / 2;

        elements.push({
          id: crypto.randomUUID(),
          type: 'text',
          content: pair.labelElement.outerHTML,
          defaultFontName: theme.fontName,
          defaultColor: theme.fontColor,
          left: centerX - pair.labelDimensions.width / 2,
          top: bottomRowY,
          width: pair.labelDimensions.width,
          height: pair.labelDimensions.height,
        } as PPTTextElement);

        elements.push({
          id: crypto.randomUUID(),
          type: 'text',
          content: pair.contentElement.outerHTML,
          defaultFontName: theme.fontName,
          defaultColor: theme.fontColor,
          left: centerX - pair.contentDimensions.width / 2,
          top: bottomRowY + maxBottomRowLabelHeight + LABEL_CONTENT_SPACING,
          width: pair.contentDimensions.width,
          height: pair.contentDimensions.height,
        } as PPTTextElement);
      }
    }

    return elements;
  },
};

export default LayoutPrimitives;
