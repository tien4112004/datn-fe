import { useEffect } from 'react';
import { useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import { useLayoutStore } from '../stores/layout';
import type { BaseNode } from '../types';
import type { Direction, Side } from '../types/constants';
import { useNodeManipulationStore, useNodeOperationsStore } from '../stores';

export interface UseNodeCommonProps<T extends BaseNode = BaseNode> {
  node: NodeProps<T>;
}

export interface UseNodeCommonReturn {
  // Store values
  layout: Direction;
  isLayouting: boolean;
  addChildNode: any;
  onNodeDelete: () => void;
  moveToChild: (sourceId: string, targetId: string, side: Side) => void;
}

export const useMindmapNodeCommon = <T extends BaseNode = BaseNode>({
  node,
}: UseNodeCommonProps<T>): UseNodeCommonReturn => {
  const addChildNode = useNodeOperationsStore((state) => state.addChildNode);
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
    addChildNode,
    onNodeDelete,
    moveToChild,
  };
};
