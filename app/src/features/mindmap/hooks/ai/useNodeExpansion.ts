import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useMindmapApiService } from '../../api';
import type { ExpandNodeParams } from '../../types/expandNode';
import type { MindmapMetadataResponse } from '../../types/service';
import { useCoreStore, useUndoRedoStore, useLayoutStore } from '../../stores';
import { convertChildrenToNodes } from '../../services/nodeGeneration';
import { htmlToMarkdown } from '../../services/utils/contentUtils';
import { buildTreeContext } from '../../services/utils/contextBuilder';
import { getRootNodeOfSubtree, getTreeLayoutType } from '../../services/utils';
import { LAYOUT_TYPE, PATH_TYPES } from '../../types';
import type { PathType } from '../../types';
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
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);

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
          throw new Error(t('expandNode.errors.parentNodeNotFound'));
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
          throw new Error(response.message || t('expandNode.errors.failedToExpand'));
        }

        const children = response.data?.children;
        if (!children || children.length === 0) {
          throw new Error(t('expandNode.errors.noChildrenGenerated'));
        }

        // 5. Look up root node for style inheritance and layout info
        const currentNodes = useCoreStore.getState().nodes;
        const currentEdges = useCoreStore.getState().edges;
        const rootNode = getRootNodeOfSubtree(params.nodeId, currentNodes);

        const rootStyle = rootNode
          ? {
              pathType: (rootNode.data?.pathType || PATH_TYPES.SMOOTHSTEP) as PathType,
              edgeColor: (rootNode.data?.edgeColor as string) || '#0044FF',
            }
          : undefined;

        // 6. Convert AI response to nodes/edges with root style
        const { nodes: newNodes, edges: newEdges } = await convertChildrenToNodes(
          children,
          parentNode,
          rootStyle
        );

        // 7. Assign initial positions so layout orders new nodes after existing siblings
        const layoutType = getTreeLayoutType(currentNodes);
        const isVerticalFlow =
          layoutType === LAYOUT_TYPE.VERTICAL_BALANCED ||
          layoutType === LAYOUT_TYPE.TOP_ONLY ||
          layoutType === LAYOUT_TYPE.BOTTOM_ONLY;

        const existingSiblingIds = new Set(
          currentEdges.filter((e) => e.source === parentNode.id).map((e) => e.target)
        );
        const existingSiblings = currentNodes.filter((n) => existingSiblingIds.has(n.id));

        const OFFSET_INCREMENT = 100;
        let startOffset: number;

        if (isVerticalFlow) {
          const maxX = existingSiblings.reduce(
            (max, s) => Math.max(max, (s.position?.x ?? 0) + (s.measured?.width ?? 180)),
            parentNode.position?.x ?? 0
          );
          startOffset = maxX + OFFSET_INCREMENT;
        } else {
          const maxY = existingSiblings.reduce(
            (max, s) => Math.max(max, (s.position?.y ?? 0) + (s.measured?.height ?? 50)),
            parentNode.position?.y ?? 0
          );
          startOffset = maxY + OFFSET_INCREMENT;
        }

        let directChildIndex = 0;
        for (const node of newNodes) {
          if (node.data.parentId === parentNode.id) {
            // Direct child — position after existing siblings
            if (isVerticalFlow) {
              node.position = {
                x: startOffset + directChildIndex * OFFSET_INCREMENT,
                y: parentNode.position?.y ?? 0,
              };
            } else {
              node.position = {
                x: parentNode.position?.x ?? 0,
                y: startOffset + directChildIndex * OFFSET_INCREMENT,
              };
            }
            directChildIndex++;
          } else {
            // Grandchild or deeper — incrementing offsets to preserve AI generation order
            const parentOfThis = newNodes.find((n) => n.id === node.data.parentId);
            const baseX = parentOfThis?.position?.x ?? 0;
            const baseY = parentOfThis?.position?.y ?? 0;
            const sameLevelSiblings = newNodes.filter((n) => n.data.parentId === node.data.parentId);
            const siblingIndex = sameLevelSiblings.indexOf(node);
            if (isVerticalFlow) {
              node.position = {
                x: baseX + (siblingIndex + 1) * OFFSET_INCREMENT,
                y: baseY + OFFSET_INCREMENT,
              };
            } else {
              node.position = {
                x: baseX + OFFSET_INCREMENT,
                y: baseY + (siblingIndex + 1) * OFFSET_INCREMENT,
              };
            }
          }
        }

        // 8. Insert with undo/redo
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
          const latestNodes = useCoreStore.getState().nodes;
          const latestRootNode = getRootNodeOfSubtree(params.nodeId, latestNodes);
          if (latestRootNode) {
            applyAutoLayout(latestRootNode.id);
          }
        }, 200);

        toast.success(t('expandNode.success.childrenGenerated'));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('expandNode.errors.failedToExpand');
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
