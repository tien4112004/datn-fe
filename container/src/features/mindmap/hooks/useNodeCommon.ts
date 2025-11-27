// hooks/useNodeCommon.ts - Optimized version
import { useEffect, useMemo } from 'react';
import { useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';
import { useLayoutStore } from '../stores/layout';
import { type Direction, type Side, type BaseNode, type LayoutType } from '../types';
import { useNodeManipulationStore, useNodeOperationsStore } from '../stores';

export interface UseNodeCommonProps<T extends BaseNode = BaseNode> {
  node: NodeProps<T>;
}

export interface UseNodeCommonReturn {
  // Store values
  layout: Direction;
  layoutType: LayoutType;
  isLayouting: boolean;
  onNodeDelete: (id: string) => void;
  moveToChild: (sourceId: string, targetId: string, side: Side) => void;
}

// Optimized selectors to prevent unnecessary re-renders
const layoutSelector = (state: any) => ({
  layout: state.layout,
  layoutType: state.layoutType,
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
  const { layout, layoutType, isLayouting } = useLayoutStore(useShallow(layoutSelector));
  const { onNodeDelete } = useNodeOperationsStore(useShallow(nodeOperationsSelector));
  const { moveToChild } = useNodeManipulationStore(useShallow(nodeManipulationSelector));

  const updateNodeInternals = useUpdateNodeInternals();

  const updateThisNodeInternals = useMemo(
    () => () => updateNodeInternals(node.id),
    [updateNodeInternals, node.id]
  );

  // Update node internals when layout changes to ensure handles are repositioned
  useEffect(() => {
    if (!isLayouting) {
      updateThisNodeInternals();
    }
  }, [isLayouting, layout, layoutType, updateThisNodeInternals]);

  return {
    layout,
    layoutType,
    isLayouting,
    onNodeDelete,
    moveToChild,
  };
};
