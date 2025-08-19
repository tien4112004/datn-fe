import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { MindMapNode, MindMapEdge, MindmapActionsType } from '../types';
import { useMindmapStore } from '../stores';

/**
 * Hook that provides action functions for mindmap operations.
 * Contains the actual implementations of mindmap action methods for cleaner separation of concerns.
 */
export const useMindmapActions = (): MindmapActionsType => {
  const setNodes = useMindmapStore((state) => state.setNodes);
  const setEdges = useMindmapStore((state) => state.setEdges);

  const { screenToFlowPosition } = useReactFlow();

  // Clipboard store methods
  const clipboardCopySelectedNodesAndEdges = useMindmapStore((state) => state.copySelectedNodesAndEdges);
  const clipboardPasteClonedNodesAndEdges = useMindmapStore((state) => state.pasteClonedNodesAndEdges);

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

  const deleteSelectedNodes = useMindmapStore((state) => state.deleteSelectedNodes);

  return {
    selectAllNodesAndEdges,
    deselectAllNodesAndEdges,
    copySelectedNodesAndEdges,
    pasteClonedNodesAndEdges,
    deleteSelectedNodes,
  };
};
