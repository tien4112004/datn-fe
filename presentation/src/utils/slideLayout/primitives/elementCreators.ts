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
import { getImageSize } from '../../image';
import { SHAPE_PATH_FORMULAS } from '../../../configs/shapes';
import type { ImageLayoutBlockInstance, TextLayoutBlockInstance, Bounds } from '../types';
import { DEFAULT_RADIUS_MULTIPLIER, DEFAULT_TITLE_LINE_SPACING } from './layoutConstants';
import { layoutItemsInBlock } from './positioning';
import { calculateLargestOptimalFontSize, applyFontSizeToElement } from './fontSizeCalculations';
import type { FontSizeRange } from '../types';
import { measureElementWithStyle } from './elementMeasurement';
import type { TextStyleConfig } from '../types';

/**
 * Create a text element with optimal font sizing
 */
export function createTextElement(
  content: string,
  container: TextLayoutBlockInstance,
  fontSizeRange?: FontSizeRange
): PPTTextElement {
  // Create initial text element with default styling
  const initialElement = createHtmlElement(content, {
    fontSize: 32, // Initial size for optimization
    ...container.text,
  });

  // Calculate optimal font size for the content to fit within bounds
  const optimalFontSize = calculateLargestOptimalFontSize(
    initialElement,
    container.bounds.width,
    container.bounds.height,
    fontSizeRange
  );

  // Apply the calculated font size to the element
  applyFontSizeToElement(initialElement, optimalFontSize, container.text?.lineHeight || 1.4);

  // Measure the element with optimized font size
  const dimensions = measureElementWithStyle(initialElement, container);

  // Calculate positioning within the container
  const position = layoutItemsInBlock([dimensions], container)[0];

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
    top: titleDimensions.top + titleDimensions.height + DEFAULT_TITLE_LINE_SPACING,
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

// Font weight mapping
const fontWeightMap: Record<string, string> = {
  normal: '400',
  bold: '700',
  bolder: 'bolder',
  lighter: 'lighter',
};

/**
 * Unified element creation function - single source of truth for all text element creation
 */
export function createHtmlElement(content: string, config: TextStyleConfig): HTMLElement {
  const p = document.createElement('p');
  const span = document.createElement('span');

  // Apply paragraph styling with defaults
  const fontSize = config.fontSize ?? 16;
  const lineHeight = config.lineHeight ?? 1.4;

  p.style.textAlign = config.textAlign || 'left';
  p.style.lineHeight = `${lineHeight}`;
  p.style.fontSize = `${fontSize}px`;
  p.style.fontFamily = config.fontFamily || 'Arial, sans-serif';
  p.style.margin = '0';

  // Apply span styling
  const fontWeightValue = config.fontWeight || 'normal';
  span.style.fontWeight = fontWeightMap[fontWeightValue.toString()] || fontWeightValue.toString();

  if (config.fontStyle) {
    span.style.fontStyle = config.fontStyle;
  }

  if (config.color) {
    span.style.color = config.color;
  }
  span.textContent = content;

  p.appendChild(span);
  return p;
}

export function updateElementFontSize(element: HTMLElement, newFontSize: number): void {
  element.style.fontSize = `${newFontSize}px`;
}

export function updateElementLineHeight(element: HTMLElement, newLineHeight: number): void {
  element.style.lineHeight = `${newLineHeight}`;
}
