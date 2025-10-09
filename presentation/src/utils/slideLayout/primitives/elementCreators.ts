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
import type {
  ImageLayoutBlockInstance,
  TextLayoutBlockInstance,
  Bounds,
  LayoutBlockInstance,
} from '../types';
import { DEFAULT_RADIUS_MULTIPLIER, DEFAULT_TITLE_LINE_SPACING } from './layoutConstants';
import { layoutItemsInBlock } from './positioning';
import { calculateLargestOptimalFontSize, applyFontSizeToElement } from './elementMeasurement';
import type { FontSizeRange } from '../types';
import { measureElement } from './elementMeasurement';
import type { TextStyleConfig } from '../types';

/**
 * Creates a PPT text element with automatically optimized font size.
 *
 * Process:
 * 1. Create initial HTML element with default size
 * 2. Calculate optimal font size that fits container
 * 3. Apply calculated font size
 * 4. Measure final dimensions
 * 5. Calculate position within container
 * 6. Convert to PPT element format
 *
 * @param content - Text content (can include HTML)
 * @param container - Container with bounds and styling
 * @param fontSizeRange - Optional font size constraints
 * @returns PPT text element ready for slide insertion
 */
export function createTextElement(
  content: string,
  container: TextLayoutBlockInstance,
  fontSizeRange?: FontSizeRange
): PPTTextElement {
  // Create initial text element with default styling
  const initialElement = createHtmlElement(
    content,
    32, // Initial size for optimization
    container.text || {}
  );

  // Calculate optimal font size for the content to fit within bounds
  const optimalFontSize = calculateLargestOptimalFontSize(initialElement, container, fontSizeRange);

  // Apply the calculated font size to the element
  applyFontSizeToElement(initialElement, optimalFontSize, container.text?.lineHeight || 1.4);

  // Measure the element with optimized font size
  const dimensions = measureElement(initialElement, container);

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
 * Creates a PPT image element with automatic aspect-ratio cropping.
 * Centers the image and clips overflow to fit container bounds.
 *
 * Cropping logic:
 * - Image wider than container: clips left/right sides
 * - Image taller than container: clips top/bottom
 *
 * @param src - Image source URL
 * @param container - Container with bounds
 * @returns PPT image element with calculated clip region
 */
export async function createImageElement(
  src: string,
  container: ImageLayoutBlockInstance
): Promise<PPTImageElement> {
  const imageOriginalSize = await getImageSize(src);
  const imageRatio = imageOriginalSize.width / imageOriginalSize.height;
  const containerRatio = container.bounds.width / container.bounds.height;

  let finalClip;
  if (imageRatio > containerRatio) {
    // Image is wider - clip left/right sides
    const clipPercent = ((1 - containerRatio / imageRatio) / 2) * 100;
    finalClip = {
      shape: 'rect',
      range: [
        [clipPercent, 0],
        [100 - clipPercent, 100],
      ],
    };
  } else {
    // Image is taller - clip top/bottom
    const clipPercent = ((1 - imageRatio / containerRatio) / 2) * 100;
    finalClip = {
      shape: 'rect',
      range: [
        [0, clipPercent],
        [100, 100 - clipPercent],
      ],
    };
  }

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
export function createCard(container: LayoutBlockInstance): PPTShapeElement {
  const formula = SHAPE_PATH_FORMULAS[ShapePathFormulasKeys.ROUND_RECT];
  const radiusMultiplier =
    container.border?.radius && typeof container.border.radius === 'number'
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
    fill: container.background ? container.background.color : 'transparent',
    outline: container.border
      ? {
          color: container.border.color,
          width: container.border.width,
        }
      : undefined,
    radius: container.border?.radius || 0,
    shadow: container.shadow,
  } as PPTShapeElement;
}

/**
 * Create a text PPT element
 */
export function createTextPPTElement(content: HTMLElement, block: TextLayoutBlockInstance): PPTTextElement {
  const dimensions = measureElement(content, block);

  const position = layoutItemsInBlock([dimensions], block)[0];

  return {
    id: crypto.randomUUID(),
    type: 'text',
    content: content.outerHTML,
    defaultFontName: block.text?.fontFamily || 'Arial',
    defaultColor: block.text?.color || '#000000',
    left: block.bounds.left,
    top: position.top,
    width: block.bounds.width,
    height: block.bounds.height,
    textType: 'title',
    lineHeight: block.text?.lineHeight,
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
 * Unified HTML element creation - single source of truth for all text element creation.
 * Creates a styled <p> element with <span> for text styling.
 *
 * Structure: <p style="..."><span style="...">content</span></p>
 * - <p>: paragraph-level styling (alignment, line height, font size)
 * - <span>: inline styling (color, weight, style)
 *
 * @param content - Text content (can include HTML)
 * @param fontSize - Font size in pixels
 * @param config - Text styling configuration
 * @returns Configured HTML element ready for measurement or insertion
 */
export function createHtmlElement(content: string, fontSize: number, config: TextStyleConfig): HTMLElement {
  const p = document.createElement('p');
  const span = document.createElement('span');

  // Apply paragraph styling with defaults
  const lineHeight = config.lineHeight ?? 1.4;

  p.style.textAlign = config.textAlign || 'left';
  p.style.lineHeight = `${lineHeight}`;
  p.style.fontSize = `${fontSize}px`;
  p.style.fontFamily = config.fontFamily || 'Arial, sans-serif';
  p.style.margin = '0';
  p.style.padding = '0px';

  // Apply span styling
  const fontWeightValue = config.fontWeight || 'normal';
  span.style.fontWeight = fontWeightMap[fontWeightValue.toString()] || fontWeightValue.toString();

  if (config.fontStyle) {
    span.style.fontStyle = config.fontStyle;
  }

  if (config.color) {
    span.style.color = config.color;
  }
  span.innerHTML = content;

  p.appendChild(span);
  return p;
}
