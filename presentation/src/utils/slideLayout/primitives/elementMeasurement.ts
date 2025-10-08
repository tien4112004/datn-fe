import type {
  LayoutBlockInstance,
  Size,
  TextLayoutBlockInstance,
  FontSizeCalculationResult,
  FontSizeRange,
} from '../types';

/**
 * Simple, direct DOM measurement - no cloning, no complex caching, no style conflicts
 */
export function measureElement(element: HTMLElement, container: LayoutBlockInstance): Size {
  // Store original styles to restore later
  const originalStyles = {
    position: element.style.position,
    visibility: element.style.visibility,
    top: element.style.top,
    left: element.style.left,
    width: element.style.width,
    whiteSpace: element.style.whiteSpace,
    overflowWrap: element.style.overflowWrap,
    wordWrap: element.style.wordWrap,
    maxHeight: element.style.maxHeight,
    overflow: element.style.overflow,
    padding: element.style.padding,
  };

  // Apply measurement styles temporarily
  element.style.position = 'absolute';
  element.style.width = 'auto';
  element.style.visibility = 'hidden';
  element.style.top = '-9999px';
  element.style.left = '-9999px';
  element.style.padding = '10px'; // Add padding to match actual rendering

  // Apply constraints from container
  if (container.bounds?.width) {
    element.style.maxWidth = `${container.bounds.width}px`;
    element.style.whiteSpace = 'normal';
    element.style.overflowWrap = 'break-word';
    element.style.wordWrap = 'break-word';
  } else {
    element.style.whiteSpace = 'nowrap';
  }

  if (container.bounds?.height) {
    element.style.maxHeight = `${container.bounds.height}px`;
    element.style.overflow = 'hidden';
  }

  // Add to DOM for measurement
  document.body.appendChild(element);

  // Measure (getBoundingClientRect already includes the padding)
  const size = {
    width: element.getBoundingClientRect().width + 20,
    height: element.getBoundingClientRect().height + 20,
  };

  // Remove from DOM and restore original styles
  document.body.removeChild(element);

  // Restore original styles
  Object.entries(originalStyles).forEach(([property, value]) => {
    if (value) {
      element.style[property as any] = value;
    } else {
      element.style.removeProperty(property);
    }
  });

  return size;
}

/**
 * Calculate unified font size for a group of labeled elements
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

export function calculateLargestOptimalFontSize(
  element: HTMLElement,
  container: TextLayoutBlockInstance,
  fontSizeRange: FontSizeRange = { minSize: 12, maxSize: 28 },
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

    fontSize -= fontSize > 20 ? 1 : 0.5;
  }

  return optimalSize;
}

// Moved updateElementFontSize and updateElementLineHeight from elementCreators.ts
export function updateElementFontSize(element: HTMLElement, newFontSize: number): void {
  element.style.fontSize = `${newFontSize}px`;
}

export function updateElementLineHeight(element: HTMLElement, newLineHeight: number): void {
  element.style.lineHeight = `${newLineHeight}`;
}
