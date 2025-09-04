// Content analysis functions
// function calculateTotalContentLength(items: string[]): number {
//   return items.reduce((total, item) => total + item.length, 0);
// }

import type { SlideViewport } from './slideLayout';
export function calculateLargestOptimalFontSize(
  content: string,
  availableWidth: number,
  availableHeight: number,
  role: 'title' | 'content' = 'content'
): number {
  // Role-specific configurations
  const config = {
    title: {
      minSize: 18,
      maxSize: 48,
      maxLines: 3,
      lineHeight: 1.2,
      heightMargin: 0.9, // Use 90% of available height
    },
    content: {
      minSize: 12,
      maxSize: 24,
      maxLines: 10,
      lineHeight: 1.4,
      heightMargin: 0.95, // Use 95% of available height
    },
  }[role];

  const targetHeight = availableHeight * config.heightMargin;
  const maxHeightPerLine = targetHeight / config.maxLines;

  // Create measurement element once
  const measureEl = document.createElement('div');
  measureEl.style.cssText = `
    position: absolute;
    visibility: hidden;
    top: -9999px;
    width: ${availableWidth}px;
    font-family: inherit;
    line-height: ${config.lineHeight};
    word-wrap: break-word;
  `;

  document.body.appendChild(measureEl);
  measureEl.textContent = content;

  // Start from max size and work down (faster for most cases)
  let fontSize = config.maxSize;
  let optimalSize = config.minSize;

  while (fontSize >= config.minSize) {
    measureEl.style.fontSize = `${fontSize}px`;

    const height = measureEl.scrollHeight;
    const estimatedLines = Math.ceil(height / (fontSize * config.lineHeight));

    // Accept if it fits within height and reasonable line count
    if (height <= targetHeight && estimatedLines <= config.maxLines) {
      optimalSize = fontSize;
      break;
    }

    // Decrement more aggressively for faster convergence
    fontSize -= fontSize > 20 ? 2 : 1;
  }

  document.body.removeChild(measureEl);
  return optimalSize;
}

/**
 * @deprecated Use calculateLargestOptimalFontSize instead
 * Since this function sometimes gives smaller font size than available space allows
 */
export function calculateOptimalFontSize(
  content: string,
  availableWidth: number,
  availableHeight: number,
  role: 'title' | 'content' = 'content'
): number {
  // Create a temporary element to measure text
  const measureElement = document.createElement('div');
  measureElement.innerHTML = content;
  measureElement.style.cssText = `
    position: absolute;
    visibility: hidden;
    top: -9999px;
    left: -9999px;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
  `;

  document.body.appendChild(measureElement);

  // Binary search for optimal font size
  let minFontSize = role === 'title' ? 16 : 10;
  let maxFontSize = role === 'title' ? 60 : 32;
  let optimalFontSize = minFontSize;

  // Binary search with precision of 0.5px
  while (maxFontSize - minFontSize > 0.5) {
    const testFontSize = (minFontSize + maxFontSize) / 2;

    // Set test font size and measure
    measureElement.style.fontSize = `${testFontSize}px`;
    measureElement.style.width = `${availableWidth}px`;
    measureElement.style.lineHeight = role === 'title' ? '1.2' : '1.4';

    const measuredWidth = measureElement.scrollWidth;
    const measuredHeight = measureElement.scrollHeight;

    // Check if text fits within available space
    if (measuredWidth <= availableWidth && measuredHeight <= availableHeight) {
      optimalFontSize = testFontSize;
      minFontSize = testFontSize;
    } else {
      maxFontSize = testFontSize;
    }
  }

  document.body.removeChild(measureElement);

  // Apply role-specific constraints
  if (role === 'title') {
    return Math.max(Math.min(optimalFontSize, 48), 18);
  } else {
    return Math.max(Math.min(optimalFontSize, 24), 12);
  }
}

export function calculateFontSizeForAvailableSpace(
  items: string[],
  availableWidth: number,
  availableHeight: number,
  viewport: SlideViewport
): { fontSize: number; lineHeight: number; spacing: number } {
  if (items.length === 0) {
    return { fontSize: 16, lineHeight: 1.4, spacing: 12 };
  }

  // Calculate adaptive spacing based on content count and available height
  let spacing: number;
  if (items.length <= 3) {
    spacing = Math.min(24, availableHeight * 0.08); // More generous spacing for few items
  } else if (items.length <= 6) {
    spacing = Math.min(16, availableHeight * 0.05); // Medium spacing
  } else {
    spacing = Math.min(10, availableHeight * 0.03); // Tighter spacing for many items
  }

  // Ensure minimum spacing
  spacing = Math.max(spacing, 6);

  // Calculate available height per item (including spacing)
  const totalSpacing = (items.length - 1) * spacing;
  const availableContentHeight = availableHeight - totalSpacing;
  const avgHeightPerItem = availableContentHeight / items.length;

  // Find the optimal font size that fits all items
  let optimalFontSize = 28; // Start with max reasonable size

  for (const item of items) {
    const itemFontSize = calculateLargestOptimalFontSize(
      `<span>${item}</span>`,
      availableWidth,
      avgHeightPerItem,
      'content'
    );
    optimalFontSize = Math.min(optimalFontSize, itemFontSize);
  }

  // Test if all items actually fit with this font size and spacing
  let totalRequiredHeight = 0;
  const testElement = document.createElement('div');
  testElement.style.cssText = `
    position: absolute;
    visibility: hidden;
    top: -9999px;
    left: -9999px;
    width: ${availableWidth}px;
    font-size: ${optimalFontSize}px;
    line-height: 1.4;
    word-wrap: break-word;
    overflow-wrap: break-word;
  `;

  document.body.appendChild(testElement);

  for (const item of items) {
    testElement.innerHTML = `<span>${item}</span>`;
    totalRequiredHeight += testElement.scrollHeight;
  }

  document.body.removeChild(testElement);

  // If total height exceeds available space, reduce font size and adjust spacing
  const totalRequiredWithSpacing = totalRequiredHeight + totalSpacing;
  if (totalRequiredWithSpacing > availableHeight) {
    const scaleFactor = availableHeight / totalRequiredWithSpacing;
    optimalFontSize *= scaleFactor * 0.92; // 8% safety margin

    // Also reduce spacing proportionally if needed
    if (scaleFactor < 0.8) {
      spacing *= Math.max(scaleFactor * 1.2, 0.6); // Reduce spacing but not too much
      spacing = Math.max(spacing, 4); // Minimum spacing
    }
  }

  // Calculate appropriate line height based on font size
  let lineHeight = 1.4;
  if (optimalFontSize <= 14) {
    lineHeight = 1.3;
  } else if (optimalFontSize >= 20) {
    lineHeight = 1.5;
  }

  // Adjust line height for content density
  if (items.length > 6) {
    lineHeight *= 0.95; // Slightly tighter for many items
  } else if (items.length <= 2) {
    lineHeight *= 1.1; // More generous for few items
  }

  return {
    fontSize: Math.max(Math.min(optimalFontSize, 28), 12),
    lineHeight,
    spacing: Math.round(spacing),
  };
}

// function getAdaptiveStyles(
//   items: string[],
//   baseTheme: Theme,
//   viewport: SlideViewport
// ): { fontSize: number; lineHeight: number } {
//   const totalLength = calculateTotalContentLength(items);
//   const averageLength = totalLength / items.length;
//   const maxLength = Math.max(...items.map((item) => item.length));

//   const baseFontSize = baseTheme.text.fontSize;
//   let adaptiveFontSize = baseFontSize;
//   let lineHeight = 1.4;

//   if (items.length > 6) {
//     adaptiveFontSize = Math.max(baseFontSize * 0.8, 12);
//     lineHeight = 1.2;
//   } else if (averageLength > 80) {
//     adaptiveFontSize = Math.max(baseFontSize * 0.85, 14);
//     lineHeight = 1.3;
//   } else if (maxLength > 120) {
//     adaptiveFontSize = Math.max(baseFontSize * 0.75, 12);
//     lineHeight = 1.2;
//   } else if (items.length <= 3 && averageLength < 30) {
//     adaptiveFontSize = Math.min(baseFontSize * 1.1, 20);
//     lineHeight = 1.5;
//   }

//   return { fontSize: adaptiveFontSize, lineHeight };
// }
