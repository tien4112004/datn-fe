import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useMindmapStore } from '../stores/useMindmapStore';
import { useClipboardStore } from '../stores/useClipboardStore';
import type { BaseMindMapNode, MindMapEdge, MindmapActionsType } from '../types';

/**
 * Hook that provides action functions for mindmap operations.
 * Contains the actual implementations of mindmap action methods for cleaner separation of concerns.
 */
export const useMindmapActions = (): MindmapActionsType => {
  const setNodes = useMindmapStore((state) => state.setNodes);
  const setEdges = useMindmapStore((state) => state.setEdges);

  const { screenToFlowPosition } = useReactFlow();

  // Clipboard store methods
  const clipboardCopySelectedNodesAndEdges = useClipboardStore((state) => state.copySelectedNodesAndEdges);
  const clipboardPasteClonedNodesAndEdges = useClipboardStore((state) => state.pasteClonedNodesAndEdges);

  const selectAllNodesAndEdges = useCallback(() => {
    setNodes((nds: BaseMindMapNode[]) => nds.map((node: BaseMindMapNode) => ({ ...node, selected: true })));
    setEdges((eds: MindMapEdge[]) => eds.map((edge: MindMapEdge) => ({ ...edge, selected: true })));
  }, []);

  const deselectAllNodesAndEdges = useCallback(() => {
    setNodes((nds: BaseMindMapNode[]) => nds.map((node: BaseMindMapNode) => ({ ...node, selected: false })));
    setEdges((eds: MindMapEdge[]) => eds.map((edge: MindMapEdge) => ({ ...edge, selected: false })));
  }, []);

  const copySelectedNodesAndEdges = useCallback(() => {
    clipboardCopySelectedNodesAndEdges();
  }, []);

  const pasteClonedNodesAndEdges = useCallback(() => {
    clipboardPasteClonedNodesAndEdges(screenToFlowPosition);
  }, []);

  const deleteSelectedNodes = useMindmapStore((state) => state.deleteSelectedNodes);

  return {
    selectAllNodesAndEdges,
    deselectAllNodesAndEdges,
    copySelectedNodesAndEdges,
    pasteClonedNodesAndEdges,
    deleteSelectedNodes,
  };
};
