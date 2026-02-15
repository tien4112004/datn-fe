import type {
  LayoutBlockInstance,
  Size,
  TextLayoutBlockInstance,
  FontSizeRange,
  TextStyleConfig,
} from '@aiprimary/core/templates';
import { createHtmlElement } from './elementCreators';

/**
 * Font Size Calculation Result
 */
export interface FontSizeCalculationResult {
  fontSize: number;
  lineHeight: number;
  spacing: number;
}

/**
 * Measures an HTML element's dimensions by cloning and temporarily adding it to the DOM.
 *
 * Process:
 * 1. Clone the element (deep copy)
 * 2. Apply measurement styles (absolute positioning, off-screen)
 * 3. Apply container constraints (maxWidth, maxHeight)
 * 4. Add to DOM and measure using getBoundingClientRect
 * 5. Remove from DOM
 *
 * Why cloning:
 * - No side effects on original element
 * - No need to store/restore styles
 * - Preserves computed styles and structure
 * - Accurate measurements with word wrapping
 *
 * @param element - HTML element to measure
 * @param container - Container providing size constraints
 * @returns Measured dimensions including padding
 */
export function measureElement(element: HTMLElement, container: LayoutBlockInstance): Size {
  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement;

  // Apply measurement styles
  clonedElement.style.position = 'absolute';
  clonedElement.style.width = 'auto';
  clonedElement.style.visibility = 'hidden';
  clonedElement.style.top = '-9999px';
  clonedElement.style.left = '-9999px';
  clonedElement.style.paddingInline = '15px'; // Add padding to match actual rendering

  // Apply constraints from container
  if (container.bounds?.width && container.label !== 'title') {
    clonedElement.style.maxWidth = `${container.bounds.width}px`;
    clonedElement.style.whiteSpace = 'normal';
    clonedElement.style.overflowWrap = 'break-word';
    clonedElement.style.wordWrap = 'break-word';
  } else {
    clonedElement.style.whiteSpace = 'nowrap';
  }

  if (container.bounds?.height) {
    clonedElement.style.maxHeight = `${container.bounds.height}px`;
    clonedElement.style.overflow = 'hidden';
  }

  // Add to DOM for measurement
  document.body.appendChild(clonedElement);

  // Measure (getBoundingClientRect already includes the padding)
  const size = {
    width: clonedElement.getBoundingClientRect().width + 25,
    height: clonedElement.getBoundingClientRect().height + 20,
  };

  // Remove cloned element from DOM
  document.body.removeChild(clonedElement);

  return size;
}

/**
 * Calculates a single unified font size for a group of elements sharing a label.
 * Takes the minimum (most constrained) size to ensure all elements fit.
 *
 * This ensures visual consistency - all elements with the same label have identical font size.
 *
 * @param elements - HTML elements to size (all share same label)
 * @param containers - Corresponding container instances with bounds
 * @param fontSizeRange - Min/max font size constraints
 * @returns Unified font size that fits all elements
 */
export function calculateUnifiedFontSizeForLabels(
  elements: HTMLElement[],
  containers: TextLayoutBlockInstance[],
  fontSizeRange?: FontSizeRange
): { fontSize: number } {
  if (elements.length === 0 || containers.length === 0 || elements.length !== containers.length) {
    return { fontSize: 16 };
  }

  // Calculate optimal font size for each element independently
  const fontSizes: number[] = [];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const container = containers[i];

    const optimalFontSize = calculateLargestOptimalFontSize(element, container, fontSizeRange);

    fontSizes.push(optimalFontSize);
  }

  // Take minimum size (most constrained)
  const minFontSize = Math.min(...fontSizes);

  return {
    fontSize: minFontSize,
  };
}

export function applyFontSizeToElements(elements: HTMLElement[], result: FontSizeCalculationResult): void {
  elements.forEach((element) => {
    updateElementFontSize(element, result.fontSize);
    updateElementLineHeight(element, result.lineHeight);
  });
}

export function applyFontSizeToElement(element: HTMLElement, fontSize: number, lineHeight: number): void {
  updateElementFontSize(element, fontSize);
  updateElementLineHeight(element, lineHeight);
}

/**
 * Binary-search-like optimization to find the largest font size that fits.
 * Starts from maxSize and decreases until content fits within 90% of container height.
 *
 * Step sizes:
 * - Fonts > 20px: decrease by 0.5px per iteration (faster for large fonts)
 * - Fonts <= 20px: decrease by 0.2px per iteration (finer control for small fonts)
 *
 * @param element - Element to optimize
 * @param container - Container with bounds constraints
 * @param fontSizeRange - Min/max size range
 * @returns Optimal font size in pixels
 */
export function calculateLargestOptimalFontSize(
  element: HTMLElement,
  container: TextLayoutBlockInstance,
  fontSizeRange: FontSizeRange = { minSize: 14, maxSize: 28 },
  lineHeight: number = 1.5
): number {
  const clonedElement = element.cloneNode(true) as HTMLElement;

  // Guard: Ensure container has valid bounds
  if (!container.bounds?.height || container.bounds.height <= 0) {
    return fontSizeRange.minSize;
  }

  // Start from max size and work down
  let fontSize = fontSizeRange.maxSize;
  let optimalSize = fontSizeRange.minSize;

  while (fontSize >= fontSizeRange.minSize) {
    // Update the cloned element's font size for testing
    updateElementFontSize(clonedElement, fontSize);
    updateElementLineHeight(clonedElement, lineHeight);

    // Measure the element with updated styling
    const measured = measureElement(clonedElement, container);

    if (measured.height <= container.bounds.height * 0.9) {
      optimalSize = fontSize;
      break;
    }

    fontSize -= fontSize > 20 ? 0.5 : 0.2;
  }

  return optimalSize;
}

export function updateElementFontSize(element: HTMLElement, newFontSize: number): void {
  element.style.fontSize = `${newFontSize}px`;
}

export function updateElementLineHeight(element: HTMLElement, newLineHeight: number): void {
  element.style.lineHeight = `${newLineHeight}`;
}

/**
 * Measures the width required to render text at a specific font size.
 * Used for calculating maximum label width in content-aware layouts.
 *
 * @param text - Text content to measure
 * @param fontSize - Font size in pixels
 * @param fontFamily - Font family (defaults to Arial)
 * @param fontWeight - Font weight (defaults to normal)
 * @returns Width in pixels required to render the text
 */
export function measureTextWidth(
  text: string,
  fontSize: number,
  fontFamily: string = 'Arial',
  fontWeight: string = 'normal'
): number {
  // Create a temporary canvas for text measurement
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    // Fallback: rough estimation
    return text.length * fontSize * 0.6;
  }

  // Set font properties
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  // Measure text
  const metrics = context.measureText(text);

  return metrics.width;
}

/**
 * Calculates the maximum width needed for a group of label texts.
 * Measures all labels at the maximum font size to determine the upper bound.
 *
 * @param texts - Array of label text strings
 * @param fontSizeRange - Font size constraints (uses maxSize for measurement)
 * @param fontFamily - Font family to use
 * @param fontWeight - Font weight to use
 * @param padding - Additional padding to add (default: 30px for 15px each side)
 * @returns Maximum width required in pixels
 */
export function calculateMaxLabelWidth(
  texts: string[],
  fontSizeRange: FontSizeRange = { minSize: 18, maxSize: 28 },
  fontFamily: string = 'Arial',
  fontWeight: string = 'normal',
  padding: number = 30
): number {
  if (texts.length === 0) return 0;

  // Measure all texts at max font size
  let maxWidth = 0;

  for (const text of texts) {
    const width = measureTextWidth(text, fontSizeRange.maxSize, fontFamily, fontWeight);
    maxWidth = Math.max(maxWidth, width);
  }

  // Add safety margin to account for canvas measurement discrepancies
  // Canvas measureText() is slightly smaller than actual rendered width
  // Add 5% extra + 5px to prevent text wrapping
  const safetyMargin = maxWidth * 0.05 + 5;

  // Add padding and safety margin
  return maxWidth + safetyMargin + padding;
}

/**
 * Calculates the maximum label height from an array of label texts.
 * Measures actual DOM height considering text wrapping within width constraint.
 *
 * @param texts - Array of label text strings to measure
 * @param containerWidth - Available width for labels (determines wrapping)
 * @param fontSizeRange - Font size range for labels (default: 18-28px)
 * @param fontFamily - Font family (default: Arial)
 * @param fontWeight - Font weight (default: bold for labels)
 * @param padding - Vertical padding to add (default: 20px)
 * @param lineHeight - Line height multiplier (default: 1.4)
 * @returns Maximum height needed for labels in pixels
 */
export function calculateMaxLabelHeight(
  texts: string[],
  containerWidth: number,
  fontSizeRange: FontSizeRange = { minSize: 18, maxSize: 28 },
  fontFamily: string = 'Arial',
  fontWeight: number | 'normal' | 'bold' | 'bolder' | 'lighter' = 'bold',
  padding: number = 20,
  lineHeight: number = 1.4
): number {
  if (texts.length === 0) return 0;

  let maxHeight = 0;

  // Create text style config for labels
  const config: TextStyleConfig = {
    fontFamily,
    fontWeight,
    lineHeight,
  };

  // Measure each label text at max font size
  for (const text of texts) {
    // Create HTML element with max font size
    const element = createHtmlElement(text, fontSizeRange.maxSize, config);

    // Create mock container with width constraint for wrapping
    const mockContainer: TextLayoutBlockInstance = {
      type: 'text',
      bounds: {
        left: 0,
        top: 0,
        width: containerWidth,
        height: 1000, // Large enough to not constrain height
      },
      label: 'label',
      layout: {},
      text: config,
    };

    // Measure height with wrapping
    const size = measureElement(element, mockContainer);
    maxHeight = Math.max(maxHeight, size.height);
  }

  // Add padding (top and bottom)
  return maxHeight + padding;
}
