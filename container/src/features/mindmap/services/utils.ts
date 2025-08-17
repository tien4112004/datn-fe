import type { MindMapNode } from '../types';
import { MINDMAP_TYPES } from '../types';

export const getAllDescendantNodes = (parentId: string, nodes: MindMapNode[]): MindMapNode[] => {
  return nodes.reduce((acc: MindMapNode[], node: MindMapNode) => {
    if (node.data.parentId === parentId) {
      acc.push(node);
      acc.push(...getAllDescendantNodes(node.id, nodes));
    }
    return acc;
  }, []);
};

export const getRootNodeOfSubtree = (nodeId: string, nodes: MindMapNode[]): MindMapNode | null => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  if (node.type === MINDMAP_TYPES.ROOT_NODE) {
    return node;
  }

  if (!node.data.parentId) {
    return null;
  }

  return getRootNodeOfSubtree(node.data.parentId, nodes);
};
