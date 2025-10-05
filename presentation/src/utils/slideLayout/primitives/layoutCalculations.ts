import { calculateLargestOptimalFontSize, type FontSizeRange } from '../fontSizeCalculator';
import { createElement } from '../htmlTextCreation';
import type { TextLayoutBlockInstance } from '../types';

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

    const optimalFontSize = calculateLargestOptimalFontSize(
      element,
      container.bounds.width,
      container.bounds.height,
      fontSizeRange
    );

    fontSizes.push(optimalFontSize);
  }

  // Take minimum size (most constrained)
  const minFontSize = Math.min(...fontSizes);

  return {
    fontSize: minFontSize,
  };
}
