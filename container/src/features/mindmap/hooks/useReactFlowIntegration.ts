import { useCallback, useEffect } from 'react';
import {
  useUpdateNodeInternals,
  useReactFlow,
  type FinalConnectionState,
  useNodesInitialized,
} from '@xyflow/react';
import { useLayoutStore } from '../stores/layout';
import type { MindMapNode } from '../types';
import { useClipboardStore, useCoreStore, useNodeManipulationStore, useNodeOperationsStore } from '../stores';
import { MINDMAP_TYPES, SIDE } from '../types';
import { getSideFromPosition } from '../services/utils';

export const useReactFlowIntegration = () => {
  const syncState = useCoreStore((state) => state.syncState);
  const updateSelectedNodeIds = useCoreStore((state) => state.updateSelectedNodeIds);
  const moveToChild = useNodeManipulationStore((state) => state.moveToChild);
  const getNode = useCoreStore((state) => state.getNode);
  const addChildNode = useNodeOperationsStore((state) => state.addChildNode);

  const updateLayout = useLayoutStore((state) => state.updateLayout);
  const setMousePosition = useClipboardStore((state) => state.setMousePosition);
  const setDragTarget = useClipboardStore((state) => state.setDragTarget);
  const setMouseOverNodeId = useClipboardStore((state) => state.setMouseOverNodeId);

  const updateNodeInternals = useUpdateNodeInternals();
  const nodesInitialized = useNodesInitialized();
  const { getIntersectingNodes, fitView, screenToFlowPosition } = useReactFlow();

  const onPaneMouseMove = useCallback((event: any) => {
    const { clientX, clientY } = event;
    setMousePosition({ x: clientX, y: clientY });
  }, []);

  const onPaneClick = useCallback((event: any) => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    }

    const { clientX, clientY } = event;
    setMousePosition({ x: clientX, y: clientY });
  }, []);

  const onInit = useCallback(async () => {
    updateLayout(undefined, updateNodeInternals);

    setTimeout(() => {
      fitView({ duration: 2000, padding: 0.1 });
    }, 800);
  }, [updateLayout, updateNodeInternals, fitView]);

  useEffect(() => {
    syncState(updateNodeInternals);
  }, [nodesInitialized]);

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

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
        const position = screenToFlowPosition({
          x: clientX,
          y: clientY,
        });

        if (!connectionState.fromNode || !connectionState.fromHandle) return;

        const parentNode = getNode(connectionState.fromNode.id);
        if (!parentNode) return;

        const side = getSideFromPosition(connectionState.fromHandle.position);
        addChildNode(parentNode, position, side, MINDMAP_TYPES.TEXT_NODE);
      }
    },
    []
  );

  const onNodeMouseEnter = useCallback(
    (_: MouseEvent, node: MindMapNode) => {
      setMouseOverNodeId(node.id);
    },
    [setMouseOverNodeId]
  );

  const onNodeMouseLeave = useCallback(() => {
    setMouseOverNodeId(null);
  }, [setMouseOverNodeId]);

  const onSelectionChange = useCallback(() => {
    updateSelectedNodeIds();
  }, [updateSelectedNodeIds]);

  return {
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    onPaneMouseMove,
    onPaneClick,
    updateNodeInternals,
    onInit,
    onConnectEnd,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onSelectionChange,
  };
};
