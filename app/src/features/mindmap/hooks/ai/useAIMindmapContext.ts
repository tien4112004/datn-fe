import { useMemo } from 'react';
import { MINDMAP_TYPES } from '../../types/constants';
import type { AIPanelContext } from '../../types/aiModification';
import { useNodeSelection } from '../useNodeSelection';
import { useCoreStore } from '../../stores';

/**
 * Detects the current AI panel context based on node selection
 *
 * Context types:
 * - no-selection: No nodes selected
 * - single-node: Exactly one text node selected
 * - same-branch: Multiple nodes from the same branch
 * - cross-branch: Multiple nodes from different branches
 */
export function useAIMindmapContext(): AIPanelContext {
  const { selectedNodes, selectedCount, isSingleSelection } = useNodeSelection();
  const { nodes } = useCoreStore((state) => ({
    nodes: state.nodes,
  }));

  return useMemo(() => {
    // No selection
    if (selectedCount === 0) {
      return { type: 'no-selection' };
    }

    // Single node selection
    if (isSingleSelection) {
      const node = selectedNodes[0];

      // Skip deprecated node types
      if (node.type === MINDMAP_TYPES.IMAGE_NODE || node.type === MINDMAP_TYPES.SHAPE_NODE) {
        return { type: 'no-selection' };
      }

      // Get parent and siblings info
      const parentNode = nodes.find((n) => n.id === node.data.parentId);
      const siblings = nodes.filter((n) => n.data.parentId === node.data.parentId && n.id !== node.id);
      const siblingContents = siblings
        .map((s) => (typeof s.data.content === 'string' ? s.data.content : ''))
        .filter(Boolean);
      const parentContent =
        typeof parentNode?.data.content === 'string' ? parentNode.data.content : undefined;

      return {
        type: 'single-node',
        node,
        parentContent,
        siblingContents,
        level: node.data.level || 0,
      };
    }

    // Multiple selections - check if same branch
    const isSameBranch = checkIfSameBranch(selectedNodes, nodes);

    if (isSameBranch) {
      // Get first node's parent for context
      const firstNode = selectedNodes[0];
      const parentNode = nodes.find((n) => n.id === firstNode.data.parentId);
      const parentContent =
        typeof parentNode?.data.content === 'string' ? parentNode.data.content : undefined;

      return {
        type: 'same-branch',
        nodes: selectedNodes,
        parentContent,
        level: firstNode.data.level || 0,
        nodeCount: selectedCount,
      };
    }

    // Cross-branch selection
    return {
      type: 'cross-branch',
      nodeCount: selectedCount,
    };
  }, [selectedNodes, selectedCount, isSingleSelection, nodes]);
}

/**
 * Check if all selected nodes are from the same branch
 * (i.e., share the same root node when tracing up the hierarchy)
 */
function checkIfSameBranch(selectedNodes: any[], allNodes: any[]): boolean {
  if (selectedNodes.length <= 1) return true;

  // Find root for each node
  const getRootId = (node: any): string => {
    let current = node;
    while (current.data.parentId) {
      const parent = allNodes.find((n) => n.id === current.data.parentId);
      if (!parent) break;
      current = parent;
    }
    return current.id;
  };

  const roots = selectedNodes.map((node) => getRootId(node));
  const uniqueRoots = new Set(roots);

  return uniqueRoots.size === 1;
}
