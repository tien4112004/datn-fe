import { calculateLargestOptimalFontSize, applyFontSizeToElement } from '../fontSizeCalculator';
import { measureElementWithStyle } from '../elementMeasurement';
import { createElement } from '../htmlTextCreation';
import type { TextLayoutBlockInstance } from '../types';
import { layoutItemsInBlock } from './layoutPositioning';

/**
 * Calculate title layout with optimal font sizing
 */
export function calculateTitleLayout(title: string, container: TextLayoutBlockInstance) {
  // Create title element
  const titleElement = createElement(title, {
    fontSize: 32, // Initial size, will be optimized
    ...container.text,
  });

  // Calculate optimal font size using the actual element
  const titleFontSize = calculateLargestOptimalFontSize(
    titleElement,
    container.bounds.width,
    container.bounds.height,
    'title'
  );

  // Apply the calculated font size to the element
  applyFontSizeToElement(titleElement, titleFontSize, 1.2);

  // Measure the element with optimized font size
  const titleDimensions = measureElementWithStyle(titleElement, container);

  const horizontalPosition = layoutItemsInBlock([titleDimensions], container)[0].left;

  const titlePosition = {
    left: horizontalPosition,
    top: container.bounds.top,
  };

  return {
    titleElement,
    titleContent: titleElement.outerHTML,
    titleDimensions,
    titlePosition,
    titleFontSize,
  };
}

/**
 * Calculate unified font size for a group of labeled elements
 */
export function calculateUnifiedFontSizeForLabels(
  elements: HTMLElement[],
  containers: TextLayoutBlockInstance[],
  type: 'title' | 'content' | 'label' = 'content'
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
      type
    );

    fontSizes.push(optimalFontSize);
  }

  // Take minimum size (most constrained)
  const minFontSize = Math.min(...fontSizes);

  return {
    fontSize: minFontSize,
  };
}
