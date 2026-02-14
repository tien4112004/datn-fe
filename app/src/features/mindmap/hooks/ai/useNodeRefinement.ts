import { useState, useCallback } from 'react';
import { aiMindmapModificationApi } from '../../services/api/aiMindmapModification';
import type { RefineNodeContentRequest } from '../../types/aiModification';
import { useCoreStore } from '../../stores';
import { toast } from 'sonner';

interface UseNodeRefinementReturn {
  isProcessing: boolean;
  error: string | null;
  refineNode: (request: RefineNodeContentRequest) => Promise<void>;
  clearError: () => void;
}

export function useNodeRefinement(): UseNodeRefinementReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { nodes, setNodes } = useCoreStore((state) => ({
    nodes: state.nodes,
    setNodes: state.setNodes,
  }));

  const refineNode = useCallback(
    async (request: RefineNodeContentRequest) => {
      setIsProcessing(true);
      setError(null);

      try {
        const response = await aiMindmapModificationApi.refineNode(request);

        if (!response.success) {
          throw new Error(response.message || 'Failed to refine node');
        }

        const refinedContent = response.data?.refinedContent;
        if (!refinedContent) {
          throw new Error('No refined content in response');
        }

        // Update the node with refined content
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === request.nodeId ? { ...node, data: { ...node.data, content: refinedContent } } : node
          )
        );

        toast.success('Node refined successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to refine node';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [nodes, setNodes]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    refineNode,
    clearError,
  };
}
