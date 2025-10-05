import { measureElement } from './elementMeasurement';
import { updateElementFontSize, updateElementLineHeight } from './htmlTextCreation';
import type { TextLayoutBlockInstance } from './types';

export interface FontSizeCalculationResult {
  fontSize: number;
  lineHeight: number;
  spacing: number;
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
  availableWidth: number,
  availableHeight: number,
  role: 'title' | 'content' | 'label' = 'content',
  lineHeight: number = 1.4
): number {
  // Role-specific configurations
  const config = {
    title: {
      minSize: 18,
      maxSize: 48,
    },
    content: {
      minSize: 12,
      maxSize: 28,
    },
    label: {
      minSize: 10,
      maxSize: 24,
    },
  }[role];

  const clonedElement = element.cloneNode(true) as HTMLElement;

  // Start from max size and work down
  let fontSize = config.maxSize;
  let optimalSize = config.minSize;

  while (fontSize >= config.minSize) {
    // Update the cloned element's font size for testing
    updateElementFontSize(clonedElement, fontSize);
    updateElementLineHeight(clonedElement, lineHeight);

    // Measure the element with updated styling
    const measured = measureElement(clonedElement, {
      maxWidth: availableWidth,
      maxHeight: availableHeight,
    });

    // Accept if it fits within constraints
    if (measured.height <= availableHeight) {
      optimalSize = fontSize;
      break;
    }

    fontSize -= fontSize > 20 ? 1 : 0.5;
  }

  return optimalSize;
}

export function calculateFontSizeForAvailableSpace(
  elements: HTMLElement[],
  availableWidth: number,
  availableHeight: number
): FontSizeCalculationResult {
  if (elements.length === 0) {
    return { fontSize: 16, lineHeight: 1.4, spacing: 12 };
  }

  // Clone elements to avoid modifying the original elements
  const clonedElements = elements.map((element) => element.cloneNode(true) as HTMLElement);

  // Calculate adaptive spacing based on content count and available height
  let spacing: number;
  if (clonedElements.length <= 3) {
    spacing = Math.min(24, availableHeight * 0.08);
  } else if (clonedElements.length <= 6) {
    spacing = Math.min(16, availableHeight * 0.05);
  } else {
    spacing = Math.min(10, availableHeight * 0.03);
  }

  spacing = Math.max(spacing, 6);

  // Calculate available height per item (including spacing)
  const totalSpacing = (clonedElements.length - 1) * spacing;
  const availableContentHeight = availableHeight - totalSpacing;
  const avgHeightPerItem = availableContentHeight / clonedElements.length;

  // Find the optimal font size that fits all elements
  let optimalFontSize = 28;

  for (const element of clonedElements) {
    const itemFontSize = calculateLargestOptimalFontSize(element, availableWidth, avgHeightPerItem);
    optimalFontSize = Math.min(optimalFontSize, itemFontSize);
  }

  // Apply optimal font size to cloned elements for testing
  clonedElements.forEach((element) => {
    updateElementFontSize(element, optimalFontSize);
    updateElementLineHeight(element, 1.4);
  });

  // Test if all elements actually fit with this font size and spacing
  let totalRequiredHeight = 0;

  for (const element of clonedElements) {
    const measured = measureElement(element, {
      maxWidth: availableWidth,
    });
    totalRequiredHeight += measured.height;
  }

  // If total height exceeds available space, reduce font size and adjust spacing
  const totalRequiredWithSpacing = totalRequiredHeight + totalSpacing;
  if (totalRequiredWithSpacing > availableHeight) {
    const scaleFactor = availableHeight / totalRequiredWithSpacing;
    optimalFontSize *= scaleFactor * 0.92; // 8% safety margin

    // Also reduce spacing proportionally if needed
    if (scaleFactor < 0.8) {
      spacing *= Math.max(scaleFactor * 1.2, 0.6);
      spacing = Math.max(spacing, 4);
    }

    // Apply adjusted font size to cloned elements for testing
    clonedElements.forEach((element) => {
      updateElementFontSize(element, optimalFontSize);
    });
  }

  // Calculate appropriate line height based on font size
  let lineHeight = 1.4;
  if (optimalFontSize <= 14) {
    lineHeight = 1.3;
  } else if (optimalFontSize >= 20) {
    lineHeight = 1.5;
  }

  // Adjust line height for content density
  if (clonedElements.length > 6) {
    lineHeight *= 0.95;
  } else if (clonedElements.length <= 2) {
    lineHeight *= 1.1;
  }

  return {
    fontSize: Math.max(Math.min(optimalFontSize, 28), 12),
    lineHeight,
    spacing: Math.round(spacing),
  };
}

export const calculateUnifiedFontSizeForBlocks = (
  items: HTMLElement[],
  containers: TextLayoutBlockInstance[]
): { fontSize: number; lineHeight: number } => {
  if (items.length === 0 || containers.length === 0 || items.length !== containers.length) {
    return { fontSize: 16, lineHeight: 1.4 };
  }

  // Calculate optimal font size for each block independently
  const blockFontSizes: { fontSize: number; lineHeight: number }[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const container = containers[i];

    const optimalFontSize = calculateLargestOptimalFontSize(
      item,
      container.bounds.width,
      container.bounds.height
    );

    blockFontSizes.push({
      fontSize: optimalFontSize,
      lineHeight: optimalFontSize * 1.4,
    });
  }

  // Take average size
  const minFontSize = Math.min(...blockFontSizes.map((b) => b.fontSize));
  const correspondingLineHeight =
    blockFontSizes.find((b) => b.fontSize === minFontSize)?.lineHeight || minFontSize * 1.4;

  return {
    fontSize: minFontSize,
    lineHeight: correspondingLineHeight / minFontSize,
  };
};
