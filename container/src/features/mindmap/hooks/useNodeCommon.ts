import { useEffect } from 'react';
import { useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
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

export const useMindmapNodeCommon = <T extends BaseNode = BaseNode>({
  node,
}: UseNodeCommonProps<T>): UseNodeCommonReturn => {
  const onNodeDelete = useNodeOperationsStore((state) => state.finalizeNodeDeletion);
  const layout = useLayoutStore((state) => state.layout);
  const isLayouting = useLayoutStore((state) => state.isLayouting);
  const moveToChild = useNodeManipulationStore((state) => state.moveToChild);

  // React Flow hooks
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(node.id);
  }, [layout, isLayouting, node.id, updateNodeInternals]);

  return {
    layout,
    isLayouting,
    onNodeDelete,
    moveToChild,
  };
};
