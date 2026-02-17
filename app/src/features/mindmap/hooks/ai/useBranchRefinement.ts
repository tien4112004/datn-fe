import { useState, useCallback } from 'react';
import { useMindmapApiService } from '../../api';
import type { RefineBranchRequest } from '../../types/aiModification';
import type { MindmapMetadataResponse } from '../../types/service';
import { useCoreStore, useUndoRedoStore } from '../../stores';
import { htmlToMarkdown, markdownToHtml } from '../../services/utils/contentUtils';
import { buildTreeContext } from '../../services/utils/contextBuilder';
import { toast } from 'sonner';

interface UseBranchRefinementReturn {
  isProcessing: boolean;
  error: string | null;
  refineBranch: (request: RefineBranchRequest) => Promise<void>;
  clearError: () => void;
}

export function useBranchRefinement(metadata?: MindmapMetadataResponse): UseBranchRefinementReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setNodes = useCoreStore((state) => state.setNodes);
  const mindmapService = useMindmapApiService();

  const prepareToPushUndo = useUndoRedoStore((state) => state.prepareToPushUndo);
  const pushToUndoStack = useUndoRedoStore((state) => state.pushToUndoStack);

  const refineBranch = useCallback(
    async (request: RefineBranchRequest) => {
      setIsProcessing(true);
      setError(null);

      try {
        // 1. Convert HTML content to Markdown for API request
        const markdownNodes = await Promise.all(
          request.nodes.map(async (node) => ({
            ...node,
            content: await htmlToMarkdown(node.content),
          }))
        );

        // 2. Build tree context for the first node (representative)
        // For branch operations, use the first node as context reference
        const nodes = useCoreStore.getState().nodes;
        const firstNodeId = request.nodes[0]?.nodeId;
        const treeContext = firstNodeId ? buildTreeContext(firstNodeId, nodes, metadata) : undefined;

        // 3. Create API request with context
        const apiRequest: RefineBranchRequest = {
          ...request,
          nodes: markdownNodes,
          context: treeContext,
        };

        // 4. Call API
        const response = await mindmapService.refineBranch(apiRequest);

        if (!response.success) {
          throw new Error(response.message || 'Failed to refine branch');
        }

        const refinedNodes = response.data?.refinedNodes;
        if (!refinedNodes || refinedNodes.length === 0) {
          throw new Error('No refined nodes returned');
        }

        // 5. Convert Markdown responses back to HTML
        const refinedNodesWithHtml = await Promise.all(
          refinedNodes.map(async (refined: { nodeId: string; content: string }) => ({
            ...refined,
            content: await markdownToHtml(refined.content),
          }))
        );

        // 6. Prepare undo/redo
        prepareToPushUndo();

        // 7. Update nodes with refined content
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            const refined = refinedNodesWithHtml.find(
              (r: { nodeId: string; content: string }) => r.nodeId === node.id
            );
            if (refined) {
              return {
                ...node,
                data: {
                  ...node.data,
                  content: refined.content,
                },
              };
            }
            return node;
          })
        );

        // 8. Push to undo stack
        pushToUndoStack();

        // 9. Show appropriate toast message
        const successCount = refinedNodesWithHtml.length;
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
    [setNodes, mindmapService, prepareToPushUndo, pushToUndoStack, metadata]
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
