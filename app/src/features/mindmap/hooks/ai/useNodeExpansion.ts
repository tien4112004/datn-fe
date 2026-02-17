import { useState, useCallback } from 'react';
import { useMindmapApiService } from '../../api';
import type { ExpandNodeParams } from '../../types/expandNode';
import type { MindmapMetadataResponse } from '../../types/service';
import { useCoreStore, useUndoRedoStore, useLayoutStore } from '../../stores';
import { convertChildrenToNodes } from '../../services/nodeGeneration';
import { htmlToMarkdown } from '../../services/utils/contentUtils';
import { buildTreeContext } from '../../services/utils/contextBuilder';
import { getRootNodeOfSubtree } from '../../services/utils';
import { toast } from 'sonner';

interface UseNodeExpansionReturn {
  isExpanding: boolean;
  error: string | null;
  expandNode: (params: ExpandNodeParams) => Promise<void>;
  clearError: () => void;
}

export function useNodeExpansion(metadata?: MindmapMetadataResponse): UseNodeExpansionReturn {
  const [isExpanding, setIsExpanding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setNodes = useCoreStore((state) => state.setNodes);
  const setEdges = useCoreStore((state) => state.setEdges);
  const mindmapService = useMindmapApiService();

  const prepareToPushUndo = useUndoRedoStore((state) => state.prepareToPushUndo);
  const pushToUndoStack = useUndoRedoStore((state) => state.pushToUndoStack);
  const applyAutoLayout = useLayoutStore((state) => state.applyAutoLayout);

  const expandNode = useCallback(
    async (params: ExpandNodeParams) => {
      setIsExpanding(true);
      setError(null);

      try {
        // 1. Get parent node and convert content to Markdown
        const parentNode = useCoreStore.getState().nodes.find((n) => n.id === params.nodeId);
        if (!parentNode) {
          throw new Error('Parent node not found');
        }

        const nodeContent = typeof parentNode.data.content === 'string' ? parentNode.data.content : '';
        const markdownContent = await htmlToMarkdown(nodeContent);

        // 2. Build tree context for generating relevant children
        const nodes = useCoreStore.getState().nodes;
        const treeContext = buildTreeContext(params.nodeId, nodes, metadata);

        // 3. Create API request with context
        const apiParams = {
          ...params,
          nodeContent: markdownContent,
          context: treeContext,
        };

        // 4. Call API
        const response = await mindmapService.expandNode(apiParams);

        if (!response.success) {
          throw new Error(response.message || 'Failed to expand node');
        }

        const children = response.data?.children;
        if (!children || children.length === 0) {
          throw new Error('No children generated. Try adjusting settings.');
        }

        // 5. Convert AI response to nodes/edges
        const { nodes: newNodes, edges: newEdges } = await convertChildrenToNodes(children, parentNode);

        // 6. Insert with undo/redo
        prepareToPushUndo();

        // Deselect all current nodes and select new ones
        setNodes((prevNodes) => [
          ...prevNodes.map((n) => ({ ...n, selected: false })),
          ...newNodes.map((n) => ({ ...n, selected: true })),
        ]);

        setEdges((prevEdges) => [...prevEdges, ...newEdges]);

        pushToUndoStack();

        // Trigger automatic layout for the expanded subtree with a small delay
        // to allow React Flow to update the DOM with the new nodes
        setTimeout(() => {
          // Find the root node of the subtree to apply layout to the entire tree
          const currentNodes = useCoreStore.getState().nodes;
          const rootNode = getRootNodeOfSubtree(params.nodeId, currentNodes);
          if (rootNode) {
            applyAutoLayout(rootNode.id);
          }
        }, 200);

        toast.success('Child nodes generated successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to expand node';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsExpanding(false);
      }
    },
    [setNodes, setEdges, mindmapService, prepareToPushUndo, pushToUndoStack, applyAutoLayout, metadata]
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
