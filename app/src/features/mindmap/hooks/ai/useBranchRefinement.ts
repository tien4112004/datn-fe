import { useState, useCallback } from 'react';
import { aiMindmapModificationApi } from '../../services/api/aiMindmapModification';
import type { RefineBranchRequest } from '../../types/aiModification';
import { useCoreStore, useUndoRedoStore } from '../../stores';
import { toast } from 'sonner';

interface UseBranchRefinementReturn {
  isProcessing: boolean;
  error: string | null;
  refineBranch: (request: RefineBranchRequest) => Promise<void>;
  clearError: () => void;
}

export function useBranchRefinement(): UseBranchRefinementReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setNodes } = useCoreStore((state) => ({
    setNodes: state.setNodes,
  }));

  const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore((state) => ({
    prepareToPushUndo: state.prepareToPushUndo,
    pushToUndoStack: state.pushToUndoStack,
  }));

  const refineBranch = useCallback(
    async (request: RefineBranchRequest) => {
      setIsProcessing(true);
      setError(null);

      try {
        // 1. Call API
        const response = await aiMindmapModificationApi.refineBranch(request);

        if (!response.success) {
          throw new Error(response.message || 'Failed to refine branch');
        }

        const refinedNodes = response.data?.refinedNodes;
        if (!refinedNodes || refinedNodes.length === 0) {
          throw new Error('No refined nodes returned');
        }

        // 2. Prepare undo/redo
        prepareToPushUndo();

        // 3. Update nodes with refined content
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            const refined = refinedNodes.find(
              (r: { nodeId: string; content: string }) => r.nodeId === node.id
            );
            if (refined) {
              return {
                ...node,
                data: {
                  ...node.data,
                  content: `<p>${refined.content}</p>`,
                },
              };
            }
            return node;
          })
        );

        // 4. Push to undo stack
        pushToUndoStack();

        // 5. Show appropriate toast message
        const successCount = refinedNodes.length;
        const totalCount = request.nodes.length;
        if (successCount < totalCount) {
          toast.warning(`${successCount} of ${totalCount} nodes refined`);
        } else {
          toast.success(`${successCount} nodes refined successfully`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to refine branch';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [setNodes, prepareToPushUndo, pushToUndoStack]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    refineBranch,
    clearError,
  };
}
