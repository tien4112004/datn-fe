import { useEffect, useRef } from 'react';
import { isEqual } from 'lodash';
import { useCoreStore } from '../stores/core';
import { useDirtyStore } from '../stores/dirty';

export const useMindmapDirtyTracking = (enabled: boolean = true) => {
  const { nodes, edges } = useCoreStore();
  const markDirty = useDirtyStore((state) => state.markDirty);
  const isDirty = useDirtyStore((state) => state.isDirty);

  // Use ref to track previous state
  const prevStateRef = useRef({ nodes, edges });

  useEffect(() => {
    if (!enabled) return;

    const currentState = { nodes, edges };

    // Check if state has actually changed using deep equality
    if (
      !isEqual(currentState.nodes, prevStateRef.current.nodes) ||
      !isEqual(currentState.edges, prevStateRef.current.edges)
    ) {
      // Only mark dirty if not already dirty (to avoid excessive dispatches)
      if (!isDirty) {
        markDirty();
      }
      prevStateRef.current = currentState;
    }
  }, [nodes, edges, isDirty, markDirty, enabled]);
};
