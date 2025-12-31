import type { MindMapNode } from '../types';
import { getAllDescendantNodes } from './utils';
import { groupByParent } from './layouts/horizontalLayoutUtils';

export interface TreeNode {
  node: MindMapNode;
  children: TreeNode[];
}

/**
 * Converts flat nodes array to hierarchical tree structure.
 * Leverages existing utilities for efficiency.
 * Time Complexity: O(n) where n = number of nodes
 */
export const buildTreeFromFlat = (rootNode: MindMapNode, allNodes: MindMapNode[]): TreeNode => {
  // Get all descendants of this root
  const descendants = getAllDescendantNodes(rootNode.id, allNodes);
  const subtreeNodes = [rootNode, ...descendants];

  // Build parent-to-children map (already sorted by siblingOrder)
  const childrenMap = groupByParent(subtreeNodes);

  // Recursively build tree
  const buildSubtree = (node: MindMapNode): TreeNode => {
    const children = childrenMap.get(node.id) || [];
    return {
      node,
      children: children.map(buildSubtree),
    };
  };

  return buildSubtree(rootNode);
};
