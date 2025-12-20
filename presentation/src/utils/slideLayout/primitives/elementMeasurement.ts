import type {
  LayoutBlockInstance,
  Size,
  TextLayoutBlockInstance,
  FontSizeRange,
} from '@aiprimary/core/templates';

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
  if (container.bounds?.width && container.label !== 'label' && container.label !== 'title') {
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
    width: clonedElement.getBoundingClientRect().width + 20,
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
