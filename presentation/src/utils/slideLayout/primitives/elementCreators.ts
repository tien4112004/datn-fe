import {
  type PPTImageElement,
  type PPTTextElement,
  type PPTShapeElement,
  type SlideBackground,
  type SlideTheme,
  SHAPE_PATH_FORMULAS_KEYS,
  type ImageElementClip,
  type TextType,
} from '@/types/slides';
import { getImageSize } from '../../image';
import { SHAPE_PATH_FORMULAS } from '../../../configs/shapes';
import type {
  ImageLayoutBlockInstance,
  TextLayoutBlockInstance,
  LayoutBlockInstance,
} from '@aiprimary/core/templates';
import { layoutItemsInBlock } from './positioning';
import { calculateLargestOptimalFontSize, applyFontSizeToElement } from './elementMeasurement';
import type { FontSizeRange } from '@aiprimary/core/templates';
import { measureElement } from './elementMeasurement';
import type { TextStyleConfig } from '@aiprimary/core/templates';

/**
 * Maps container label to appropriate TextType for theme application.
 * This ensures text elements receive correct font styling based on their semantic role.
 *
 * Mapping logic:
 * - 'label', 'itemTitle' → 'itemTitle' (uses labelFontColor/labelFontName)
 * - 'itemNumber', 'partNumber', 'pageNumber' → corresponding type (uses labelFontColor/labelFontName)
 * - 'title' → 'title' (uses titleFontColor/titleFontName)
 * - 'subtitle' → 'subtitle' (uses fontColor/fontName)
 * - 'item', 'content', or unknown → 'content' (uses fontColor/fontName)
 *
 * @param label - Container label string from template config
 * @returns Appropriate TextType for theme styling
 */
export function mapLabelToTextType(label: string | undefined): TextType {
  if (!label) return 'content';

  const labelLower = label.toLowerCase();

  // Label-type elements (use labelFontColor/labelFontName)
  if (labelLower === 'label' || labelLower === 'itemtitle') {
    return 'itemTitle';
  }

  // Number-type elements (also use labelFontColor/labelFontName)
  if (labelLower === 'itemnumber') return 'itemNumber';
  if (labelLower === 'partnumber') return 'partNumber';
  if (labelLower === 'pagenumber') return 'pageNumber';

  // Title elements
  if (labelLower === 'title') return 'title';
  if (labelLower === 'subtitle') return 'subtitle';

  // List items
  if (labelLower === 'item') return 'item';

  // Default to content for everything else
  return 'content';
}

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
 * @param textType - Optional text type for styling
 * @param dataId - Optional data ID for deterministic element ID (elem-{dataId})
 * @returns PPT text element ready for slide insertion
 */
export function createTextElement(
  content: string,
  container: TextLayoutBlockInstance,
  fontSizeRange?: FontSizeRange,
  textType?: TextType,
  dataId?: string
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
    id: dataId ? `elem-${dataId}` : crypto.randomUUID(),
    type: 'text',
    content: initialElement.outerHTML,
    defaultFontName: container.text.fontFamily || 'Arial',
    defaultColor: container.text.color || '#000000',
    left: position.left,
    top: position.top,
    width: dimensions.width,
    height: dimensions.height,
    textType: textType || 'content',
  } as PPTTextElement;
}

/**
 * Creates an HTML list element (<ul> or <ol>) with styled list items.
 * Centralizes list element creation logic for consistent styling across all list operations.
 *
 * @param contents - Array of HTML content for each list item
 * @param listType - Type of list: 'ul' or 'ol'
 * @param fontSize - Font size in pixels
 * @param container - Container with text styling configuration
 * @param options - Optional configuration
 * @param options.applyMarginTop - Whether to apply marginTop to items (for measurement)
 * @param options.paragraphSpace - Space between list items (default: 25)
 * @param options.startNumber - Starting number for ordered lists (ol only)
 * @returns Configured HTML list element
 */
function createListHtmlElement(
  contents: string[],
  listType: 'ul' | 'ol',
  fontSize: number,
  container: TextLayoutBlockInstance,
  options: {
    applyMarginTop?: boolean;
    paragraphSpace?: number;
    startNumber?: number;
  } = {}
): HTMLElement {
  const { applyMarginTop = false, paragraphSpace = 25, startNumber } = options;

  // Create list element (ul or ol)
  const listElement = document.createElement(listType);
  listElement.style.fontSize = `${fontSize}px`;
  listElement.style.fontFamily = container.text.fontFamily || '';

  // Set start attribute for ordered lists if specified
  if (listType === 'ol' && startNumber !== undefined) {
    listElement.setAttribute('start', startNumber.toString());
  }

  // Create and append list items
  const listItems = contents.map((content) => {
    const el = createHtmlElement(content, fontSize, container.text || {});
    applyFontSizeToElement(el, fontSize, container.text?.lineHeight || 1.4);

    if (applyMarginTop) {
      el.style.marginTop = `${paragraphSpace}px`;
    }

    const li = document.createElement('li');
    li.appendChild(el);
    return li;
  });

  listElement.append(...listItems);

  return listElement;
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
 * @param textType - Optional explicit textType (if not provided, maps from container.label)
 * @param dataIds - Optional array of data IDs matching contents array length (for deterministic element IDs)
 * @returns Array of PPT text elements (1 if fits, 2 if column wrap needed)
 */
export function createListElements(
  contents: string[],
  container: TextLayoutBlockInstance,
  fontSizeRange?: FontSizeRange,
  textType?: TextType,
  dataIds?: string[]
): PPTTextElement[] {
  const paragraphSpace = 25; // Spacing between list items
  const listType = container.combined?.ordered ? 'ol' : 'ul';

  // Determine textType: use explicit parameter or map from label
  const finalTextType = textType || mapLabelToTextType(container.label);

  // Create HTML elements for each content item
  const htmlElements = contents.map((content) => createHtmlElement(content, 32, container.text || {}));

  // Calculate optimal font size that fits all items
  const listFontSize = htmlElements.map((el) =>
    calculateLargestOptimalFontSize(el, container, fontSizeRange)
  );
  const optimalFontSize = Math.min(...listFontSize) - 1;

  // Create wrapper list element with optimal font size (with marginTop for measurement)
  const listElement = createListHtmlElement(contents, listType, optimalFontSize, container, {
    applyMarginTop: true,
    paragraphSpace,
  });

  // Measure the complete list to check for overflow
  let dimensions = measureElement(listElement, container);

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
    let columnOptimalFontSize = Math.min(...columnFontSizes) - 1;

    // Create temporary left column to verify height constraint
    let leftList = createListHtmlElement(
      leftColumnContents,
      listType,
      columnOptimalFontSize,
      columnContainer,
      {
        applyMarginTop: true,
        paragraphSpace,
      }
    );

    // Measure left column height and adjust font size if it exceeds container height
    let leftColumnDimensions = measureElement(leftList, columnContainer);
    const minFontSize = fontSizeRange?.minSize || 12;

    while (leftColumnDimensions.height > container.bounds.height && columnOptimalFontSize > minFontSize) {
      // Reduce font size and remeasure
      columnOptimalFontSize = Math.max(columnOptimalFontSize - 1, minFontSize);

      leftList = createListHtmlElement(leftColumnContents, listType, columnOptimalFontSize, columnContainer, {
        applyMarginTop: true,
        paragraphSpace,
      });

      leftColumnDimensions = measureElement(leftList, columnContainer);
    }

    // Create final left column without marginTop
    leftList = createListHtmlElement(leftColumnContents, listType, columnOptimalFontSize, columnContainer, {
      applyMarginTop: false,
      paragraphSpace,
    });

    // Create right column with proper start attribute for ordered lists
    const rightList = createListHtmlElement(
      rightColumnContents,
      listType,
      columnOptimalFontSize,
      columnContainer,
      {
        applyMarginTop: false,
        paragraphSpace,
        startNumber: listType === 'ol' ? midpoint + 1 : undefined,
      }
    );

    // Calculate positions for both columns
    const leftPosition = layoutItemsInBlock([dimensions], container)[0];

    return [
      {
        id: dataIds && dataIds[0] ? `elem-${dataIds[0]}+${dataIds[midpoint - 1]}` : crypto.randomUUID(),
        type: 'text',
        content: leftList.outerHTML,
        defaultFontName: container.text.fontFamily || 'Arial',
        defaultColor: container.text.color || '#000000',
        left: leftPosition.left + 10,
        top: leftPosition.top - 12.5,
        width: columnWidth - 10,
        height: container.bounds.height,
        paragraphSpace,
        rotate: 0,
        textType: finalTextType,
        _combined: {
          isCombined: true,
          label: container.label,
          columnIndex: 0,
          totalColumns: 2,
        },
      } as any,
      {
        id:
          dataIds && dataIds[midpoint]
            ? `elem-${dataIds[midpoint]}+${dataIds[dataIds.length - 1]}`
            : crypto.randomUUID(),
        type: 'text',
        content: rightList.outerHTML,
        defaultFontName: container.text.fontFamily || 'Arial',
        defaultColor: container.text.color || '#000000',
        left: leftPosition.left + columnWidth + columnGap + 10,
        top: leftPosition.top - 12.5,
        width: columnWidth - 10,
        height: container.bounds.height,
        paragraphSpace,
        rotate: 0,
        textType: finalTextType,
        _combined: {
          isCombined: true,
          label: container.label,
          columnIndex: 1,
          totalColumns: 2,
        },
      } as any,
    ];
  }

  // Single column - check if content fits, otherwise reduce font size
  let singleColumnFontSize = optimalFontSize;
  const minFontSize = fontSizeRange?.minSize || 12;

  // If content doesn't fit and wrapping is disabled, reduce font size iteratively
  while (dimensions.height > container.bounds.height && singleColumnFontSize > minFontSize) {
    singleColumnFontSize = Math.max(singleColumnFontSize - 1, minFontSize);

    // Recreate list with reduced font size (with marginTop for measurement)
    const reducedListElement = createListHtmlElement(contents, listType, singleColumnFontSize, container, {
      applyMarginTop: true,
      paragraphSpace,
    });

    dimensions = measureElement(reducedListElement, container);

    // Update listElement for final output
    if (singleColumnFontSize > minFontSize || dimensions.height <= container.bounds.height) {
      listElement.innerHTML = '';
      listElement.style.fontSize = `${singleColumnFontSize}px`;
      listElement.append(...Array.from(reducedListElement.children));
    }
  }

  // Create final single column without marginTop (paragraphSpace handles spacing)
  const finalListElement = createListHtmlElement(contents, listType, singleColumnFontSize, container, {
    applyMarginTop: false,
    paragraphSpace,
  });

  const position = layoutItemsInBlock([dimensions], container)[0];

  return [
    {
      id: dataIds && dataIds[0] ? `elem-${dataIds[0]}+${dataIds[dataIds.length - 1]}` : crypto.randomUUID(),
      type: 'text',
      content: finalListElement.outerHTML,
      defaultFontName: container.text.fontFamily || 'Arial',
      defaultColor: container.text.color || '#000000',
      left: position.left + 10, // Padding left
      top: position.top - paragraphSpace,
      width: container.bounds.width - 20,
      height: container.bounds.height,
      paragraphSpace,
      rotate: 0,
      textType: finalTextType,
      _combined: {
        isCombined: true,
        label: container.label,
        columnIndex: 0,
        totalColumns: 1,
      },
    } as any,
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
 * @param dataId - Optional data ID for deterministic element ID (elem-{dataId})
 * @returns PPT image element with calculated clip region
 */
export async function createImageElement(
  src: string,
  container: ImageLayoutBlockInstance,
  dataId?: string
): Promise<PPTImageElement> {
  const imageOriginalSize = await getImageSize(src);
  const imageRatio = imageOriginalSize.width / imageOriginalSize.height;
  const containerRatio = container.bounds.width / container.bounds.height;

  let finalClip: ImageElementClip;
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
    id: dataId ? `elem-${dataId}` : crypto.randomUUID(),
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
    radius: container.border?.radius || 0,
  };
}

/**
 * Create a card (shape) element
 * @param container - Layout block instance with bounds and styling
 * @param dataId - Optional data ID for deterministic element ID (elem-deco-{dataId})
 */
export function createCard(container: LayoutBlockInstance, dataId?: string): PPTShapeElement {
  const formula = SHAPE_PATH_FORMULAS[SHAPE_PATH_FORMULAS_KEYS.ROUND_RECT_CUSTOM];
  const radiusValue = container.border?.radius || 0;

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
    id: dataId ? `elem-deco-${dataId}` : crypto.randomUUID(),
    type: 'shape',
    pathFormula: SHAPE_PATH_FORMULAS_KEYS.ROUND_RECT_CUSTOM,
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
    shapeType: 'card',
  } as PPTShapeElement;
}

/**
 * Create a text PPT element
 * @param content - HTML element containing the text
 * @param block - Text layout block instance
 * @param textType - Optional explicit textType (if not provided, maps from block.label)
 * @param dataId - Optional data ID for deterministic element ID (elem-{dataId})
 */
export function createTextPPTElement(
  content: HTMLElement,
  block: TextLayoutBlockInstance,
  textType?: TextType,
  dataId?: string
): PPTTextElement {
  const dimensions = measureElement(content, block);

  const position = layoutItemsInBlock([dimensions], block)[0];

  const textConfig = block.text || {};

  // Use explicit textType or map from label
  const finalTextType = textType || mapLabelToTextType(block.label);

  return {
    id: dataId ? `elem-${dataId}` : crypto.randomUUID(),
    type: 'text',
    content: content.outerHTML,
    defaultFontName: textConfig.fontFamily,
    defaultColor: textConfig.color,
    left: block.bounds.left,
    top: position.top,
    width: block.bounds.width,
    height: block.bounds.height,
    textType: finalTextType,
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
