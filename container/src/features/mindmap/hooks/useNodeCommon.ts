// hooks/useNodeCommon.ts - Optimized version
import { useEffect, useMemo } from 'react';
import { useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';
import { useLayoutStore } from '../stores/layout';
import { type Direction, type Side, type BaseNode } from '../types';
import { useNodeManipulationStore, useNodeOperationsStore } from '../stores';

export interface UseNodeCommonProps<T extends BaseNode = BaseNode> {
  node: NodeProps<T>;
}

export interface UseNodeCommonReturn {
  // Store values
  layout: Direction;
  isLayouting: boolean;
  onNodeDelete: (id: string) => void;
  moveToChild: (sourceId: string, targetId: string, side: Side) => void;
}

// Optimized selectors to prevent unnecessary re-renders
const layoutSelector = (state: any) => ({
  layout: state.layout,
  isLayouting: state.isLayouting,
});

const nodeOperationsSelector = (state: any) => ({
  onNodeDelete: state.finalizeNodeDeletion,
});

const nodeManipulationSelector = (state: any) => ({
  moveToChild: state.moveToChild,
});

export const useMindmapNodeCommon = <T extends BaseNode = BaseNode>({
  node,
}: UseNodeCommonProps<T>): UseNodeCommonReturn => {
  // Use shallow comparison to prevent unnecessary re-renders
  const { layout, isLayouting } = useLayoutStore(useShallow(layoutSelector));
  const { onNodeDelete } = useNodeOperationsStore(useShallow(nodeOperationsSelector));
  const { moveToChild } = useNodeManipulationStore(useShallow(nodeManipulationSelector));

  // React Flow hooks
  const updateNodeInternals = useUpdateNodeInternals();

  // Memoize the update function to prevent recreating it on every render
  const updateThisNodeInternals = useMemo(
    () => () => updateNodeInternals(node.id),
    [updateNodeInternals, node.id]
  );

  // Only update internals when layout actually changes, not on every render
  useEffect(() => {
    if (!isLayouting) {
      updateThisNodeInternals();
    }
  }, [isLayouting, updateThisNodeInternals]);

  return {
    layout,
    isLayouting,
    onNodeDelete,
    moveToChild,
  };
};
