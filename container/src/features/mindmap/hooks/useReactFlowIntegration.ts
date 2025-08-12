import { useCallback, useEffect, useState } from 'react';
import { useUpdateNodeInternals, useNodesInitialized, type Connection } from '@xyflow/react';
import { useMindmapStore } from '../stores/useMindmapStore';
import { useLayoutStore } from '../stores/useLayoutStore';
import type { BaseNode } from '../types';
import { useClipboardStore } from '../stores';

export const useReactFlowIntegration = () => {
  const nodeLength = useMindmapStore((state) => state.nodes.length);
  const syncState = useMindmapStore((state) => state.syncState);

  const storeOnConnect = useMindmapStore((state) => state.onConnect);

  const updateLayout = useLayoutStore((state) => state.updateLayout);
  const setMousePosition = useClipboardStore((state) => state.setMousePosition);

  const [stateChanged, setStateChanged] = useState(false);

  const updateNodeInternals = useUpdateNodeInternals();
  const nodesInitialized = useNodesInitialized();

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
    console.log('useReactFlowIntegration useEffect triggered');
    if (nodeLength > 0 && nodesInitialized) {
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

  const onConnect = useCallback(
    (params: Connection) => {
      storeOnConnect(params);
    },
    [storeOnConnect]
  );

  const onNodeDrag = useCallback((_: MouseEvent, node: BaseNode) => {
    node;
    // TODO: Implement logic to make dragging node a child of the intersecting node after auto layout
  }, []);

  return {
    onConnect,
    onNodeDrag,
    onPaneMouseMove,
    onPaneClick,
    updateNodeInternals,
  };
};
