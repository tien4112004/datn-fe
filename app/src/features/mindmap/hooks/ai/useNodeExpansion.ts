import { useState, useCallback } from 'react';
import { aiMindmapModificationApi } from '../../services/api/aiMindmapModification';
import type { ExpandNodeParams } from '../../types/expandNode';
import { useCoreStore, useUndoRedoStore } from '../../stores';
import { convertChildrenToNodes } from '../../services/nodeGeneration';
import { toast } from 'sonner';

interface UseNodeExpansionReturn {
  isExpanding: boolean;
  error: string | null;
  expandNode: (params: ExpandNodeParams) => Promise<void>;
  clearError: () => void;
}

export function useNodeExpansion(): UseNodeExpansionReturn {
  const [isExpanding, setIsExpanding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { nodes, setNodes, setEdges } = useCoreStore((state) => ({
    nodes: state.nodes,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
  }));

  const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore((state) => ({
    prepareToPushUndo: state.prepareToPushUndo,
    pushToUndoStack: state.pushToUndoStack,
  }));

  const expandNode = useCallback(
    async (params: ExpandNodeParams) => {
      setIsExpanding(true);
      setError(null);

      try {
        // 1. Call API
        const response = await aiMindmapModificationApi.expandNode(params);

        if (!response.success) {
          throw new Error(response.message || 'Failed to expand node');
        }

        const children = response.data?.children;
        if (!children || children.length === 0) {
          throw new Error('No children generated. Try adjusting settings.');
        }

        // 2. Get parent node info
        const parentNode = nodes.find((n) => n.id === params.nodeId);
        if (!parentNode) {
          throw new Error('Parent node not found');
        }

        // 3. Convert AI response to nodes/edges
        const { nodes: newNodes, edges: newEdges } = await convertChildrenToNodes(children, parentNode);

        // 4. Insert with undo/redo
        prepareToPushUndo();

        // Deselect all current nodes and select new ones
        setNodes((prevNodes) => [
          ...prevNodes.map((n) => ({ ...n, selected: false })),
          ...newNodes.map((n) => ({ ...n, selected: true })),
        ]);

        setEdges((prevEdges) => [...prevEdges, ...newEdges]);

        pushToUndoStack();

        toast.success('Child nodes generated successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to expand node';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsExpanding(false);
      }
    },
    [nodes, setNodes, setEdges, prepareToPushUndo, pushToUndoStack]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isExpanding,
    error,
    expandNode,
    clearError,
  };
}
