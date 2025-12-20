import type { PPTElement } from '@/types/slides';
import type { Bounds, LayoutBlockInstance, TextStyleConfig } from '@aiprimary/core/templates';

export function getAllDescendantInstances(instance: LayoutBlockInstance): LayoutBlockInstance[] {
  const result: LayoutBlockInstance[] = [];

  function traverse(node: LayoutBlockInstance | undefined) {
    if (!node) return;
    result.push(node);
    if (node.children && node.children.length) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(instance);
  return result;
}

/**
 * Recursively get all label instances
 */
export function recursivelyGetAllLabelInstances(
  container: LayoutBlockInstance,
  label: string
): LayoutBlockInstance[] {
  let labels: LayoutBlockInstance[] = [];

  if (!container.children || container.children.length === 0) return labels;

  for (const child of container.children) {
    if (child.label === label) {
      labels.push(child);
    }

    if (child.children && child.children.length > 0) {
      labels = labels.concat(recursivelyGetAllLabelInstances(child, label));
    }
  }

  return labels;
}

/**
 * Collects descendant texts by label into structured items.
 * Works with any label names (e.g., 'label', 'content', 'item', 'title', etc.)
 *
 * @param data - Record mapping label names to arrays of values
 * @returns Array of objects where each object has keys matching label names
 *
 * @example
 * collectDescendantTextsByLabel({
 *   label: ['Q1', 'Q2'],
 *   content: ['Data 1', 'Data 2']
 * })
 * // Returns: [{ label: 'Q1', content: 'Data 1' }, { label: 'Q2', content: 'Data 2' }]
 */
export function collectDescendantTextsByLabel(data: Record<string, string[]>): Array<Record<string, string>> {
  const maxLength = Math.max(...Object.values(data).map((arr) => arr.length));

  return Array.from({ length: maxLength }, (_, i) => {
    const result: Record<string, string> = {};

    for (const [labelKey, values] of Object.entries(data)) {
      if (values[i] !== undefined) {
        result[labelKey] = values[i];
      }
    }

    return result;
  });
}

/**
 * Extracts text styles for each label from children configuration.
 *
 * @param container - Container with children array
 * @returns Map of label names to their text style configurations
 */
export function extractLabelStyles(container: any): Map<string, TextStyleConfig> {
  const labelStyles = new Map<string, TextStyleConfig>();

  if (container.children) {
    container.children.forEach((child: any) => {
      if (child.label && child.type === 'text' && child.text) {
        labelStyles.set(child.label, child.text);
      }
    });
  }

  return labelStyles;
}

/**
 * Calculate bounding box from one or more PPT elements.
 * For single element: uses its dimensions directly.
 * For multiple elements: calculates combined bounding box.
 *
 * @param elements - Array of PPT elements
 * @returns Bounding box or null if no elements
 */
export function calculateElementBounds(elements: PPTElement[]): Bounds | null {
  if (elements.length === 0) return null;

  if (elements.length === 1) {
    const el = elements[0];
    return {
      left: el.left,
      top: el.top,
      width: el.width,
      height: (el as any).height ?? 0,
    };
  }

  // Multiple elements - calculate combined bounding box
  let minLeft = Infinity;
  let minTop = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;

  for (const el of elements) {
    minLeft = Math.min(minLeft, el.left);
    minTop = Math.min(minTop, el.top);
    maxRight = Math.max(maxRight, el.left + el.width);
    maxBottom = Math.max(maxBottom, el.top + ((el as any).height ?? 0));
  }

  return {
    left: minLeft,
    top: minTop,
    width: maxRight - minLeft,
    height: maxBottom - minTop,
  };
}
