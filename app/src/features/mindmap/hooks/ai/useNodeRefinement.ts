import { useState, useCallback } from 'react';
import { useMindmapApiService } from '../../api';
import type { RefineNodeContentRequest } from '../../types/aiModification';
import type { MindmapMetadataResponse } from '../../types/service';
import { useCoreStore } from '../../stores';
import { htmlToMarkdown, markdownToHtml } from '../../services/utils/contentUtils';
import { buildTreeContext } from '../../services/utils/contextBuilder';
import { toast } from 'sonner';

interface UseNodeRefinementReturn {
  isProcessing: boolean;
  error: string | null;
  refineNode: (request: RefineNodeContentRequest) => Promise<void>;
  clearError: () => void;
}

export function useNodeRefinement(metadata?: MindmapMetadataResponse): UseNodeRefinementReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setNodes = useCoreStore((state) => state.setNodes);
  const mindmapService = useMindmapApiService();

  const refineNode = useCallback(
    async (request: RefineNodeContentRequest) => {
      setIsProcessing(true);
      setError(null);

      try {
        // Convert HTML content to Markdown for API request
        const markdownContent = await htmlToMarkdown(request.currentContent);

        // Build tree context from current state
        const nodes = useCoreStore.getState().nodes;
        const treeContext = buildTreeContext(request.nodeId, nodes, metadata);

        // Create API request with context
        const apiRequest: RefineNodeContentRequest = {
          ...request,
          currentContent: markdownContent,
          context: treeContext,
        };

        const response = await mindmapService.refineNode(apiRequest);

        if (!response.success) {
          throw new Error(response.message || 'Failed to refine node');
        }

        const refinedMarkdown = response.data?.refinedContent;
        if (!refinedMarkdown) {
          throw new Error('No refined content in response');
        }

        // Convert Markdown response back to HTML for storage
        const refinedContent = await markdownToHtml(refinedMarkdown);

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
    [setNodes, mindmapService, metadata]
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
