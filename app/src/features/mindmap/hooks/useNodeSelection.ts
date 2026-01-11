import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCoreStore, useClipboardStore, useNodeOperationsStore } from '../stores';
import type { MindMapNode } from '../types';

interface NodeSelectionState {
  selectedNodes: MindMapNode[];
  selectedNodeIds: Set<string>;
  selectedCount: number;
  hasSelection: boolean;
  isSingleSelection: boolean;
  isMultiSelection: boolean;
  firstSelectedNode: MindMapNode | null;
}

interface NodeSelectionActions {
  deleteSelected: () => void;
  copyToClipboard: () => void;
  selectAll: () => void;
  deselectAll: () => void;
}

export interface UseNodeSelectionReturn extends NodeSelectionState, NodeSelectionActions {}

/**
 * Custom hook to manage node selection state and actions.
 * Provides a centralized interface for working with selected nodes in the mindmap.
 */
export function useNodeSelection(): UseNodeSelectionReturn {
  // Core store selectors
  // Optimize: Select only selected nodes directly from store to avoid re-running hook on unrelated node updates
  const selectedNodes = useCoreStore(useShallow((state) => state.nodes.filter((node) => node.selected)));
  const selectedNodeIds = useCoreStore(useShallow((state) => state.selectedNodeIds));
  const selectAllNodesAndEdges = useCoreStore((state) => state.selectAllNodesAndEdges);
  const deselectAllNodesAndEdges = useCoreStore((state) => state.deselectAllNodesAndEdges);

  // Clipboard store actions
  const copyToClipboardAction = useClipboardStore((state) => state.copyToClipboard);

  // Node operations store actions
  const markNodeForDeletion = useNodeOperationsStore((state) => state.markNodeForDeletion);

  // Derived state (no longer needs useMemo for filtering as it's done in selector)
  // markRender('useNodeSelection'); // Removed debug logic

  const selectedCount = selectedNodes.length;
  const hasSelection = selectedCount > 0;
  const isSingleSelection = selectedCount === 1;
  const isMultiSelection = selectedCount > 1;
  const firstSelectedNode = selectedNodes[0] || null;

  // Actions
  const deleteSelected = useCallback(() => {
    markNodeForDeletion();
  }, [markNodeForDeletion]);

  const copyToClipboard = useCallback(() => {
    copyToClipboardAction();
  }, [copyToClipboardAction]);

  const selectAll = useCallback(() => {
    selectAllNodesAndEdges();
  }, [selectAllNodesAndEdges]);

  const deselectAll = useCallback(() => {
    deselectAllNodesAndEdges();
  }, [deselectAllNodesAndEdges]);

  return {
    // State
    selectedNodes,
    selectedNodeIds,
    selectedCount,
    hasSelection,
    isSingleSelection,
    isMultiSelection,
    firstSelectedNode,
    // Actions
    deleteSelected,
    copyToClipboard,
    selectAll,
    deselectAll,
  };
}
