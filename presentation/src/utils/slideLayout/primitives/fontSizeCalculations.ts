import type { TextLayoutBlockInstance, FontSizeCalculationResult, FontSizeRange } from '../types';
import { updateElementFontSize, updateElementLineHeight } from './elementCreators';
import { measureElement } from './elementMeasurement';

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
