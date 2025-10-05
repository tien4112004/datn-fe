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
