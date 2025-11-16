import { useEffect, useRef } from 'react';
import { useCoreStore } from '../stores/core';
import { useDirtyStore } from '../stores/dirty';

export const useMindmapDirtyTracking = () => {
  const { nodes, edges } = useCoreStore();
  const markDirty = useDirtyStore((state) => state.markDirty);
  const isDirty = useDirtyStore((state) => state.isDirty);

  // Use ref to track previous state
  const prevStateRef = useRef<{ nodes: string; edges: string }>({
    nodes: JSON.stringify(nodes),
    edges: JSON.stringify(edges),
  });

  useEffect(() => {
    const currentState = {
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges),
    };

    // Check if state has actually changed
    if (
      currentState.nodes !== prevStateRef.current.nodes ||
      currentState.edges !== prevStateRef.current.edges
    ) {
      // Only mark dirty if not already dirty (to avoid excessive dispatches)
      if (!isDirty) {
        markDirty();
      }
      prevStateRef.current = currentState;
    }
  }, [nodes, edges, isDirty, markDirty]);
};
