import type { LayoutBlockInstance } from '../types';

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
