import { useCallback, useEffect, useState } from 'react';
import { useUpdateNodeInternals, useNodesInitialized, useReactFlow } from '@xyflow/react';
import { useMindmapStore } from '../stores/useMindmapStore';
import { useLayoutStore } from '../stores/useLayoutStore';
import type { BaseNode } from '../types';
import { useClipboardStore } from '../stores';
import { DIRECTION } from '../types/constants';

export const useReactFlowIntegration = () => {
  const nodeLength = useMindmapStore((state) => state.nodes.length);
  const syncState = useMindmapStore((state) => state.syncState);
  const moveToChild = useMindmapStore((state) => state.moveToChild);
  const getNode = useMindmapStore((state) => state.getNode);

  const updateLayout = useLayoutStore((state) => state.updateLayout);
  const setMousePosition = useClipboardStore((state) => state.setMousePosition);
  const setDragTarget = useClipboardStore((state) => state.setDragTarget);
  const layout = useLayoutStore((state) => state.layout);

  const [stateChanged, setStateChanged] = useState(false);

  const updateNodeInternals = useUpdateNodeInternals();
  const nodesInitialized = useNodesInitialized();
  const { getIntersectingNodes } = useReactFlow();

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
    if (nodeLength > 0 && nodesInitialized && layout !== DIRECTION.NONE) {
      // Add a small delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        updateLayout();
        setStateChanged(true);
      }, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [nodesInitialized]);

  useEffect(() => {
    if (!stateChanged) return;

    const timeoutId = setTimeout(() => {
      syncState(updateNodeInternals);
      setStateChanged(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [stateChanged]);

  const determineSideFromPosition = useCallback((draggedNode: BaseNode, targetNode: any) => {
    const targetCenterX = targetNode.position.x + (targetNode.measured?.width ?? 0) / 2;
    const draggedCenterX = draggedNode.position.x + (draggedNode.measured?.width ?? 0) / 2;
    return draggedCenterX < targetCenterX ? 'left' : 'right';
  }, []);

  const onNodeDragStart = useCallback(
    (_: MouseEvent) => {
      setDragTarget(null);
    },
    [setDragTarget]
  );

  const onNodeDrag = useCallback(
    (_: MouseEvent, node: BaseNode) => {
      const intersections = getIntersectingNodes(node).map((n) => n.id);

      if (intersections.length === 0) {
        setDragTarget(null);
        return;
      }

      const targetNodeId = intersections[0];
      if (targetNodeId === node.id) {
        setDragTarget(null);
        return;
      }

      setDragTarget(targetNodeId);
    },
    [getIntersectingNodes, setDragTarget]
  );

  const onNodeDragStop = useCallback(
    (_: MouseEvent, node: BaseNode) => {
      const intersections = getIntersectingNodes(node).map((n) => n.id);

      setDragTarget(null);

      if (intersections.length === 0) return;

      const targetNodeId = intersections[0];
      if (targetNodeId === node.id) return;

      const targetNode = getNode(targetNodeId);
      if (!targetNode) return;

      const side = determineSideFromPosition(node, targetNode);
      moveToChild(node.id, targetNodeId, side);
    },
    [getIntersectingNodes, getNode, moveToChild, determineSideFromPosition, setDragTarget]
  );

  return {
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    onPaneMouseMove,
    onPaneClick,
    updateNodeInternals,
  };
};
