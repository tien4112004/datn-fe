import { useCallback, useEffect } from 'react';
import { useReactFlow, useUpdateNodeInternals, useNodesInitialized, type Connection } from '@xyflow/react';
import { useMindmapStore } from '../stores/useMindmapStore';
import { useLayoutStore } from '../stores/useLayoutStore';
import type { MindMapNode } from '../types';
import { useClipboardStore } from '../stores';

export const useReactFlowIntegration = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect: storeOnConnect } = useMindmapStore();
  const { getIntersectingNodes } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const updateNodeInternals = useUpdateNodeInternals();
  const layoutUpdateLayout = useLayoutStore((state) => state.updateLayout);

  const setMousePosition = useClipboardStore((state) => state.setMousePosition);
  const onPaneMouseMove = useCallback((event: any) => {
    const { clientX, clientY } = event;
    setMousePosition({ x: clientX, y: clientY });
  }, []);

  const onPaneClick = useCallback(() => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    }
  }, []);

  // Auto-layout effect when nodes are initialized
  useEffect(() => {
    if (nodes.length > 0 && nodesInitialized) {
      // Add a small delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        layoutUpdateLayout();

        setTimeout(() => {
          updateNodeInternals(nodes.map((node) => node.id));
        }, 10);
      }, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [nodes.length, nodesInitialized, layoutUpdateLayout, updateNodeInternals]);

  const onConnect = useCallback(
    (params: Connection) => {
      storeOnConnect(params);
    },
    [storeOnConnect]
  );

  const onNodeDrag = useCallback(
    (_: MouseEvent, node: MindMapNode) => {
      const intersections = getIntersectingNodes(node).map((n) => n.id);

      if (intersections.length > 0) {
        const intersectingNode = nodes.find((n) => n.id === intersections[0]);
        if (intersectingNode) {
          // TODO: Implement logic to make dragging node a child of the intersecting node after auto layout
        }
      }
    },
    [getIntersectingNodes, nodes]
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDrag,
    onPaneMouseMove,
    onPaneClick,
    updateNodeInternals,
  };
};
