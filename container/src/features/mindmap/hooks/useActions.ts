import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useClipboardStore } from '../stores/clipboard';
import type { MindMapNode, MindMapEdge, MindmapActionsType } from '../types';
import { useCoreStore, useNodeOperationsStore } from '../stores';

/**
 * Hook that provides action functions for mindmap operations.
 * Contains the actual implementations of mindmap action methods for cleaner separation of concerns.
 */
export const useMindmapActions = (): MindmapActionsType => {
  const setNodes = useCoreStore((state) => state.setNodes);
  const setEdges = useCoreStore((state) => state.setEdges);

  const { screenToFlowPosition } = useReactFlow();

  // Clipboard store methods
  const clipboardCopySelectedNodesAndEdges = useClipboardStore((state) => state.copySelectedNodesAndEdges);
  const clipboardPasteClonedNodesAndEdges = useClipboardStore((state) => state.pasteClonedNodesAndEdges);

  const selectAllNodesAndEdges = useCallback(() => {
    setNodes((nds: MindMapNode[]) => nds.map((node: MindMapNode) => ({ ...node, selected: true })));
    setEdges((eds: MindMapEdge[]) => eds.map((edge: MindMapEdge) => ({ ...edge, selected: true })));
  }, []);

  const deselectAllNodesAndEdges = useCallback(() => {
    setNodes((nds: MindMapNode[]) => nds.map((node: MindMapNode) => ({ ...node, selected: false })));
    setEdges((eds: MindMapEdge[]) => eds.map((edge: MindMapEdge) => ({ ...edge, selected: false })));
  }, []);

  const copySelectedNodesAndEdges = useCallback(() => {
    clipboardCopySelectedNodesAndEdges();
  }, []);

  const pasteClonedNodesAndEdges = useCallback(() => {
    clipboardPasteClonedNodesAndEdges(screenToFlowPosition);
  }, []);

  const deleteSelectedNodes = useNodeOperationsStore((state) => state.deleteSelectedNodes);

  return {
    selectAllNodesAndEdges,
    deselectAllNodesAndEdges,
    copySelectedNodesAndEdges,
    pasteClonedNodesAndEdges,
    deleteSelectedNodes,
  };
};
