import type { ElementMeasurementConstraints } from './htmlTextCreation';
import type { LayoutBlockInstance, Size } from './types';

/**
 * Simple, direct DOM measurement - no cloning, no complex caching, no style conflicts
 */
export function measureElement(element: HTMLElement, constraints?: ElementMeasurementConstraints): Size {
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
  };

  // Apply measurement styles temporarily
  element.style.position = 'absolute';
  element.style.width = 'auto';
  element.style.visibility = 'hidden';
  element.style.top = '-9999px';
  element.style.left = '-9999px';

  // Apply constraints
  if (constraints?.maxWidth) {
    element.style.maxWidth = `${constraints.maxWidth}px`;
    element.style.whiteSpace = 'normal';
    element.style.overflowWrap = 'break-word';
    element.style.wordWrap = 'break-word';
  } else {
    element.style.whiteSpace = 'nowrap';
  }

  if (constraints?.maxHeight) {
    element.style.maxHeight = `${constraints.maxHeight}px`;
    element.style.overflow = 'hidden';
  }

  // Add to DOM for measurement
  document.body.appendChild(element);

  // Measure
  const size = {
    width: element.getBoundingClientRect().width + 20, // Add padding because of ProseMirror
    height: element.getBoundingClientRect().height + 20, // Add padding because of ProseMirror
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

export function measureElementWithStyle(element: HTMLElement, container?: LayoutBlockInstance): Size {
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
  };

  // Apply measurement styles temporarily
  element.style.position = 'absolute';
  element.style.width = 'auto';
  element.style.visibility = 'hidden';
  element.style.top = '-9999px';
  element.style.left = '-9999px';

  // Apply configurations
  if (container?.bounds?.width) {
    element.style.maxWidth = `${container.bounds.width}px`;
    element.style.whiteSpace = 'normal';
    element.style.overflowWrap = 'break-word';
    element.style.wordWrap = 'break-word';
  } else {
    element.style.whiteSpace = 'nowrap';
  }

  if (container?.bounds?.height) {
    element.style.maxHeight = `${container.bounds.height}px`;
    element.style.overflow = 'hidden';
  }

  // Padding
  if (container?.padding) {
    if (container.padding.top) {
      element.style.paddingTop = `${container.padding.top}px`;
    }

    if (container.padding.bottom) {
      element.style.paddingBottom = `${container.padding.bottom}px`;
    }

    if (container.padding.left) {
      element.style.paddingLeft = `${container.padding.left}px`;
    }

    if (container.padding.right) {
      element.style.paddingRight = `${container.padding.right}px`;
    }
  }

  // Border width
  if (container?.border?.width) {
    element.style.borderWidth = `${container.border.width}px`;
    element.style.borderStyle = 'solid';
  }

  // Add to DOM for measurement
  document.body.appendChild(element);

  // Measure
  const size = {
    width: element.getBoundingClientRect().width + 20, // Add padding because of ProseMirror
    height: element.getBoundingClientRect().height + 20, // Add padding because of ProseMirror
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

export function measureElementForBlock(
  element: HTMLElement,
  availableWidth: number,
  availableHeight: number,
  widthUtilization: number = 0.9
): Size {
  const maxWidth = availableWidth * widthUtilization;
  return measureElement(element, {
    maxWidth,
    maxHeight: availableHeight,
  });
}
