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
    shadow: container.shadow,
  } as PPTTextElement;
}

/**
 * Creates PPT combined text element(s) with unified font sizing across all items.
 * When content overflows, splits into two separate PPTTextElement instances.
 * Pattern defines the structure, this function handles measurement and sizing.
 * Supports both <ul> (unordered) and <ol> (ordered) lists.
 *
 * @param contents - Array of HTML content for each item (already formatted with pattern)
 * @param container - Container with bounds and styling
 * @param fontSizeRange - Optional font size constraints
 * @param listType - Type of list: 'ul' for unordered or 'ol' for ordered (default: 'ul')
 * @returns Array of PPT text elements (1 if fits, 2 if column wrap needed)
 */
export function createListElements(
  contents: string[],
  container: TextLayoutBlockInstance,
  fontSizeRange?: FontSizeRange
): PPTTextElement[] {
  const paragraphSpace = 25; // Spacing between list items

  // Create HTML elements for each content item
  const htmlElements = contents.map((content) => createHtmlElement(content, 32, container.text || {}));

  // Calculate optimal font size that fits all items
  const listFontSize = htmlElements.map((el) =>
    calculateLargestOptimalFontSize(el, container, fontSizeRange)
  );
  const optimalFontSize = Math.min(...listFontSize);

  // Apply unified font size to all elements (with marginTop for measurement only)
  htmlElements.forEach((el) => {
    applyFontSizeToElement(el, optimalFontSize, container.text?.lineHeight || 1.4);
    el.style.marginTop = `${paragraphSpace}px`; // Temporarily add for measurement
  });

  const listType = container.combined?.ordered ? 'ol' : 'ul';

  // Create wrapper list element (ul or ol) with proper font size
  const listElement = document.createElement(listType);
  listElement.style.fontSize = `${optimalFontSize}px`;
  listElement.style.fontFamily = container.text.fontFamily || '';
  listElement.append(
    ...htmlElements.map((html) => {
      const li = document.createElement('li');
      li.appendChild(html);
      return li;
    })
  );

  // Measure the complete list to check for overflow
  const dimensions = measureElement(listElement, container);

  // Check if content exceeds container height - if so, split into 2 columns
  // OR if twoColumn is explicitly enabled, force two-column layout
  const needsColumnWrap = dimensions.height > container.bounds.height || container.combined?.twoColumn;

  if (needsColumnWrap && container.combined?.wrapping !== false) {
    // Split items into two columns
    const midpoint = Math.ceil(contents.length / 2);
    const leftColumnContents = contents.slice(0, midpoint);
    const rightColumnContents = contents.slice(midpoint);

    const columnGap = 30;
    const columnWidth = (container.bounds.width - columnGap) / 2;

    // Create a temporary container with column width for recalculating font size
    const columnContainer = {
      ...container,
      bounds: {
        ...container.bounds,
        width: columnWidth - 10, // Account for padding
      },
    } as TextLayoutBlockInstance;

    // Recalculate optimal font size for all items with the new column width constraint
    const allColumnContents = [...leftColumnContents, ...rightColumnContents];
    const columnHtmlElements = allColumnContents.map((content) =>
      createHtmlElement(content, 32, container.text || {})
    );

    const columnFontSizes = columnHtmlElements.map((el) =>
      calculateLargestOptimalFontSize(el, columnContainer, fontSizeRange)
    );
    let columnOptimalFontSize = Math.min(...columnFontSizes);

    // Create temporary left column to verify height constraint
    let leftList = document.createElement(listType);
    leftList.style.fontSize = `${columnOptimalFontSize}px`;
    leftList.style.fontFamily = container.text.fontFamily || '';
    leftList.append(
      ...leftColumnContents.map((content) => {
        const el = createHtmlElement(content, columnOptimalFontSize, container.text || {});
        applyFontSizeToElement(el, columnOptimalFontSize, container.text?.lineHeight || 1.4);
        el.style.marginTop = `${paragraphSpace}px`; // Temporarily add for measurement
        const li = document.createElement('li');
        li.appendChild(el);
        return li;
      })
    );

    // Measure left column height and adjust font size if it exceeds container height
    let leftColumnDimensions = measureElement(leftList, columnContainer);
    const minFontSize = fontSizeRange?.minSize || 12;

    while (leftColumnDimensions.height > container.bounds.height && columnOptimalFontSize > minFontSize) {
      // Reduce font size and remeasure
      columnOptimalFontSize = Math.max(columnOptimalFontSize - 1, minFontSize);

      leftList = document.createElement(listType);
      leftList.style.fontSize = `${columnOptimalFontSize}px`;
      leftList.style.fontFamily = container.text.fontFamily || '';
      leftList.append(
        ...leftColumnContents.map((content) => {
          const el = createHtmlElement(content, columnOptimalFontSize, container.text || {});
          applyFontSizeToElement(el, columnOptimalFontSize, container.text?.lineHeight || 1.4);
          el.style.marginTop = `${paragraphSpace}px`;
          const li = document.createElement('li');
          li.appendChild(el);
          return li;
        })
      );

      leftColumnDimensions = measureElement(leftList, columnContainer);
    }

    // Create final left column without marginTop
    leftList = document.createElement(listType);
    leftList.style.fontSize = `${columnOptimalFontSize}px`;
    leftList.style.fontFamily = container.text.fontFamily || '';
    leftList.append(
      ...leftColumnContents.map((content) => {
        const el = createHtmlElement(content, columnOptimalFontSize, container.text || {});
        applyFontSizeToElement(el, columnOptimalFontSize, container.text?.lineHeight || 1.4);
        // Don't apply marginTop here - it will be handled by paragraphSpace
        const li = document.createElement('li');
        li.appendChild(el);
        return li;
      })
    );

    // Create right column with proper start attribute for ordered lists
    const rightList = document.createElement(listType);
    rightList.style.fontSize = `${columnOptimalFontSize}px`;
    rightList.style.fontFamily = container.text.fontFamily || '';

    // For ordered lists, set the start attribute to continue numbering
    if (listType === 'ol') {
      rightList.setAttribute('start', (midpoint + 1).toString());
    }

    rightList.append(
      ...rightColumnContents.map((content) => {
        const el = createHtmlElement(content, columnOptimalFontSize, container.text || {});
        applyFontSizeToElement(el, columnOptimalFontSize, container.text?.lineHeight || 1.4);
        // Don't apply marginTop here - it will be handled by paragraphSpace
        const li = document.createElement('li');
        li.appendChild(el);
        return li;
      })
    );

    // Calculate positions for both columns
    const leftPosition = layoutItemsInBlock([dimensions], container)[0];

    return [
      {
        id: crypto.randomUUID(),
        type: 'text',
        content: leftList.outerHTML,
        defaultFontName: container.text.fontFamily || 'Arial',
        defaultColor: container.text.color || '#000000',
        left: leftPosition.left + 10,
        top: leftPosition.top - 12.5,
        width: columnWidth - 10,
        height: container.bounds.height,
        shadow: container.shadow,
        paragraphSpace,
      } as PPTTextElement,
      {
        id: crypto.randomUUID(),
        type: 'text',
        content: rightList.outerHTML,
        defaultFontName: container.text.fontFamily || 'Arial',
        defaultColor: container.text.color || '#000000',
        left: leftPosition.left + columnWidth + columnGap + 10,
        top: leftPosition.top - 12.5,
        width: columnWidth - 10,
        height: container.bounds.height,
        shadow: container.shadow,
        paragraphSpace,
      } as PPTTextElement,
    ];
  }

  // Single column - content fits
  const position = layoutItemsInBlock([dimensions], container)[0];

  return [
    {
      id: crypto.randomUUID(),
      type: 'text',
      content: listElement.outerHTML,
      defaultFontName: container.text.fontFamily || 'Arial',
      defaultColor: container.text.color || '#000000',
      left: position.left + 10, // Padding left
      top: position.top - 12.5,
      width: container.bounds.width - 20,
      height: container.bounds.height,
      shadow: container.shadow,
      paragraphSpace,
    } as PPTTextElement,
  ];
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
  const formula = SHAPE_PATH_FORMULAS[ShapePathFormulasKeys.ROUND_RECT_CUSTOM];
  const radiusValue =
    container.border?.radius && typeof container.border.radius === 'number'
      ? container.border.radius
      : Math.min(container.bounds.width, container.bounds.height) * DEFAULT_RADIUS_MULTIPLIER;

  const radiusMultiplier = radiusValue / Math.min(container.bounds.width, container.bounds.height);

  // Map border directions to corner keypoints [topLeft, topRight, bottomRight, bottomLeft]
  const directions = container.border?.directions || ['top', 'right', 'bottom', 'left'];
  const hasTop = directions.includes('top');
  const hasRight = directions.includes('right');
  const hasBottom = directions.includes('bottom');
  const hasLeft = directions.includes('left');

  // Apply radius only to corners where both adjacent sides have borders
  const keypoints = [
    hasTop && hasLeft ? radiusMultiplier : 0, // top-left
    hasTop && hasRight ? radiusMultiplier : 0, // top-right
    hasBottom && hasRight ? radiusMultiplier : 0, // bottom-right
    hasBottom && hasLeft ? radiusMultiplier : 0, // bottom-left
  ];

  const path = formula.formula(container.bounds.width, container.bounds.height, keypoints);

  return {
    id: crypto.randomUUID(),
    type: 'shape',
    pathFormula: ShapePathFormulasKeys.ROUND_RECT_CUSTOM,
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
          borderRadius: `${container.border.radius || 0}`,
        }
      : undefined,
    shadow: container.shadow,
    keypoints,
  } as PPTShapeElement;
}

/**
 * Create a text PPT element
 */
export function createTextPPTElement(content: HTMLElement, block: TextLayoutBlockInstance): PPTTextElement {
  const dimensions = measureElement(content, block);

  const position = layoutItemsInBlock([dimensions], block)[0];

  const textConfig = block.text || {};

  return {
    id: crypto.randomUUID(),
    type: 'text',
    content: content.outerHTML,
    defaultFontName: textConfig.fontFamily,
    defaultColor: textConfig.color,
    left: block.bounds.left,
    top: position.top,
    width: block.bounds.width,
    height: block.bounds.height,
    textType: 'title',
    lineHeight: textConfig.lineHeight,
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

  // Apply paragraph styling with defaults
  const lineHeight = config.lineHeight ?? 1.4;

  p.classList.add('ProseMirror-static');
  p.style.textAlign = config.textAlign || 'left';
  p.style.lineHeight = `${lineHeight}`;
  p.style.fontSize = `${fontSize}px`;
  p.style.fontFamily = config.fontFamily || 'Arial, sans-serif';
  p.style.margin = '0';
  p.style.padding = '0px';

  // Apply span styling
  const fontWeightValue = config.fontWeight || 'normal';
  p.style.fontWeight = fontWeightMap[fontWeightValue.toString()] || fontWeightValue.toString();

  if (config.fontStyle) {
    p.style.fontStyle = config.fontStyle;
  }

  if (config.color) {
    p.style.color = config.color;
  }
  p.innerHTML = content;

  return p;
}
