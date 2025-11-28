import type { MindMapNode } from '../../types';
import { MINDMAP_TYPES } from '../../types';

// ============================================================================
// Tree Traversal Utilities
// ============================================================================

/**
 * Gets all nodes in a subtree starting from a given root node.
 * Handles cycles by tracking visited nodes.
 *
 * @param rootId - The ID of the root node to start from
 * @param nodes - Array of all available nodes
 * @returns Array of nodes that are descendants of the root (including root)
 */
export const getSubtreeNodes = (rootId: string, nodes: MindMapNode[]): MindMapNode[] => {
  const subtreeNodes: MindMapNode[] = [];
  const visited = new Set<string>();

  const traverse = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      subtreeNodes.push(node);

      // Find children of this node
      const children = nodes.filter((n) => n.data.parentId === nodeId);
      children.forEach((child) => traverse(child.id));
    }
  };

  traverse(rootId);
  return subtreeNodes;
};

/**
 * Finds all root nodes in a set of nodes.
 *
 * @param nodes - Array of all nodes
 * @returns Array of root nodes
 */
export const findRootNodes = (nodes: MindMapNode[]): MindMapNode[] =>
  nodes.filter((node) => node.type === MINDMAP_TYPES.ROOT_NODE);

/**
 * Builds a map of parent IDs to their child nodes.
 *
 * @param nodes - Array of all nodes
 * @returns Map of parent IDs to child nodes
 */
export const buildChildrenMap = (nodes: MindMapNode[]): Map<string, MindMapNode[]> => {
  const childrenMap = new Map<string, MindMapNode[]>();

  for (const node of nodes) {
    const parentId = node.data.parentId;
    if (!parentId) continue;

    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(node);
  }

  return childrenMap;
};

/**
 * Gets the edges that belong to a specific subtree.
 *
 * @param treeNodeIds - Set of node IDs in the tree
 * @param edges - All edges in the mindmap
 * @returns Edges that connect nodes within the tree
 */
export const getTreeEdges = <E extends { source: string; target: string }>(
  treeNodeIds: Set<string>,
  edges: E[]
): E[] => edges.filter((edge) => treeNodeIds.has(edge.source) && treeNodeIds.has(edge.target));
