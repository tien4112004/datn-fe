import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useMindmap } from '../context/MindmapContext';
import { useClipboardStore } from '../stores/useClipboardStore';
import type { MindMapNode, MindMapEdge, MindmapActionsType } from '../types';

/**
 * Hook that provides action functions for mindmap operations.
 * Contains the actual implementations of mindmap action methods for cleaner separation of concerns.
 */
export const useMindmapActions = (): MindmapActionsType => {
  const { nodes, edges, setNodes, setEdges, markNodeForDeletion } = useMindmap();

  const { screenToFlowPosition } = useReactFlow();

  // Clipboard store methods
  const clipboardCopySelectedNodesAndEdges = useClipboardStore((state) => state.copySelectedNodesAndEdges);
  const clipboardPasteClonedNodesAndEdges = useClipboardStore((state) => state.pasteClonedNodesAndEdges);

  const selectAllNodesAndEdges = useCallback(() => {
    setNodes((nds: MindMapNode[]) => nds.map((node: MindMapNode) => ({ ...node, selected: true })));
    setEdges((eds: MindMapEdge[]) => eds.map((edge: MindMapEdge) => ({ ...edge, selected: true })));
  }, [setNodes, setEdges]);

  const deselectAllNodesAndEdges = useCallback(() => {
    setNodes((nds: MindMapNode[]) => nds.map((node: MindMapNode) => ({ ...node, selected: false })));
    setEdges((eds: MindMapEdge[]) => eds.map((edge: MindMapEdge) => ({ ...edge, selected: false })));
  }, [setNodes, setEdges]);

  const copySelectedNodesAndEdges = useCallback(() => {
    clipboardCopySelectedNodesAndEdges(nodes, edges);
  }, [nodes, edges, clipboardCopySelectedNodesAndEdges]);

  const pasteClonedNodesAndEdges = useCallback(() => {
    clipboardPasteClonedNodesAndEdges(screenToFlowPosition, setNodes, setEdges);
  }, [clipboardPasteClonedNodesAndEdges, screenToFlowPosition, setNodes, setEdges]);

  const deleteSelectedNodes = useCallback(() => {
    const selectedNodeIds = nodes.filter((node) => node.selected).map((node) => node.id);
    selectedNodeIds.forEach((nodeId) => markNodeForDeletion(nodeId));
  }, [nodes, markNodeForDeletion]);

  return {
    selectAllNodesAndEdges,
    deselectAllNodesAndEdges,
    copySelectedNodesAndEdges,
    pasteClonedNodesAndEdges,
    deleteSelectedNodes,
  };
};
