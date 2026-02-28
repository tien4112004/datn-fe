import { useState, useCallback } from 'react';
import { useMindmapApiService } from '../../api';
import type { RefineNodeContentRequest } from '../../types/aiModification';
import type { MindmapMetadataResponse } from '../../types/service';
import { useCoreStore } from '../../stores';
import { useLayoutStore } from '../../stores/layout';
import { htmlToMarkdown, markdownToHtml } from '../../services/utils/contentUtils';
import { buildTreeContext } from '../../services/utils/contextBuilder';
import { getRootNodeOfSubtree, getRootForceLayout } from '../../services/utils';
import type { RootNode } from '../../types';
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

        // Check if auto-layout is enabled for this tree
        const currentNodes = useCoreStore.getState().nodes;
        const rootNode = getRootNodeOfSubtree(request.nodeId, currentNodes);
        const isForceLayout = rootNode ? getRootForceLayout(rootNode as RootNode) : false;

        if (isForceLayout) {
          // forceLayout enabled: update content, then re-layout subtree after DOM measurement
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              node.id === request.nodeId ? { ...node, data: { ...node.data, content: refinedContent } } : node
            )
          );

          setTimeout(() => {
            const latestNodes = useCoreStore.getState().nodes;
            const latestRoot = getRootNodeOfSubtree(request.nodeId, latestNodes);
            if (latestRoot) {
              useLayoutStore.getState().applyAutoLayout(latestRoot.id);
            }
          }, 200);
        } else {
          // forceLayout disabled: lock current width so content wraps vertically
          const targetNode = currentNodes.find((n) => n.id === request.nodeId);
          const currentWidth = targetNode?.measured?.width ?? targetNode?.width;

          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              node.id === request.nodeId
                ? {
                    ...node,
                    ...(currentWidth ? { width: currentWidth } : {}),
                    data: { ...node.data, content: refinedContent },
                  }
                : node
            )
          );
        }

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
