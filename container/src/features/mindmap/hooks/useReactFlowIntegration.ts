import { useCallback, useEffect, useState } from 'react';
import { useUpdateNodeInternals, useReactFlow } from '@xyflow/react';
import { useLayoutStore } from '../stores/layout';
import type { MindMapNode } from '../types';
import { useClipboardStore, useCoreStore, useNodeManipulationStore } from '../stores';
import { SIDE } from '../types';

export const useReactFlowIntegration = () => {
  const syncState = useCoreStore((state) => state.syncState);
  const moveToChild = useNodeManipulationStore((state) => state.moveToChild);
  const getNode = useCoreStore((state) => state.getNode);

  const updateLayout = useLayoutStore((state) => state.updateLayout);
  const setMousePosition = useClipboardStore((state) => state.setMousePosition);
  const setDragTarget = useClipboardStore((state) => state.setDragTarget);

  const [stateChanged, setStateChanged] = useState(false);

  const updateNodeInternals = useUpdateNodeInternals();
  const { getIntersectingNodes, fitView } = useReactFlow();

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

  const onInit = useCallback(async () => {
    updateLayout();
    setStateChanged(true);

    setTimeout(() => {
      fitView({ duration: 2000, padding: 0.1 });
    }, 800);
  }, []);

  useEffect(() => {
    if (!stateChanged) return;

    const timeoutId = setTimeout(() => {
      syncState(updateNodeInternals);
      setStateChanged(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [stateChanged]);

  const determineSideFromPosition = useCallback((draggedNode: MindMapNode, targetNode: any) => {
    const targetCenterX = targetNode.position.x + (targetNode.measured?.width ?? 0) / 2;
    const draggedCenterX = draggedNode.position.x + (draggedNode.measured?.width ?? 0) / 2;
    return draggedCenterX < targetCenterX ? SIDE.LEFT : SIDE.RIGHT;
  }, []);

  const onNodeDragStart = useCallback(
    (_: MouseEvent) => {
      setDragTarget(null);
    },
    [setDragTarget]
  );

  const onNodeDrag = useCallback(
    (_: MouseEvent, node: MindMapNode) => {
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
    (_: MouseEvent, node: MindMapNode) => {
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
    onInit,
  };
};
