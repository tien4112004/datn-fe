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
} from '../fontSizeCalculator';
import { measureElementForBlock, measureElementWithStyle } from '../elementMeasurement';
import { createElement as createHTMLElement } from '../htmlTextCreation';
import { getImageSize } from '../../image';
import { SHAPE_PATH_FORMULAS } from '../../../configs/shapes';
import type { ImageLayoutBlockInstance, TextLayoutBlockInstance, Bounds } from '../types';
import { DEFAULT_RADIUS_MULTIPLIER } from './layoutConstants';
import { getPosition, layoutItemsInBlock } from './layoutPositioning';

/**
 * Create a text element with optimal font sizing
 */
export function createTextElement(content: string, container: TextLayoutBlockInstance): PPTTextElement {
  // Create initial text element with default styling
  const initialElement = createHTMLElement(content, {
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
  const position = getPosition(container.bounds, dimensions, {
    horizontalAlignment: container.layout?.horizontalAlignment,
    verticalAlignment: container.layout?.verticalAlignment,
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
}

/**
 * Create item elements with unified styles
 */
export async function createItemElementsWithStyles(
  items: string[],
  container: TextLayoutBlockInstance
): Promise<PPTTextElement[]> {
  // Always optimize font size - create temporary elements to calculate optimal size
  const tempItemElements = items.map((item) =>
    createHTMLElement(item, {
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
    const itemElement = createHTMLElement(item, {
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
  const itemPositions = layoutItemsInBlock(
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
}

/**
 * Create text elements with unified styles
 */
export async function createTextElementsWithUnifiedStyles(
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
    const itemElement = createHTMLElement(item, {
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
  const itemPositions = layoutItemsInBlock(
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
}

/**
 * Create an image element
 */
export async function createImageElement(
  src: string,
  container: ImageLayoutBlockInstance
): Promise<PPTImageElement> {
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
}

/**
 * Create a title line element
 */
export function createTitleLine(titleDimensions: Bounds, theme: SlideTheme): PPTLineElement {
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
}

/**
 * Create a card (shape) element
 */
export function createCard(container: {
  bounds: Bounds;
  border?: { color: string; width: number; radius?: number };
}): PPTShapeElement {
  const formula = SHAPE_PATH_FORMULAS[ShapePathFormulasKeys.ROUND_RECT];
  const radiusMultiplier = container.border?.radius
    ? container.border.radius / Math.min(container.bounds.width, container.bounds.height)
    : DEFAULT_RADIUS_MULTIPLIER;
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
}

/**
 * Create a text PPT element
 */
export function createTextPPTElement(content: HTMLElement, block: TextLayoutBlockInstance): PPTTextElement {
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
}

/**
 * Process slide background
 */
export function processBackground(theme: SlideTheme): SlideBackground {
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
}
