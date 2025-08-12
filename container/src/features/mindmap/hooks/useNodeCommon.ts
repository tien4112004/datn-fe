import { useState, useEffect } from 'react';
import { useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import { useMindmapStore } from '../stores/useMindmapStore';
import { useLayoutStore } from '../stores/useLayoutStore';
import type { BaseNode } from '../types';

export interface UseNodeCommonProps<T extends BaseNode = BaseNode> {
  node: NodeProps<T>;
}

export interface UseNodeCommonReturn<T extends BaseNode = BaseNode> {
  // State
  isMouseOver: boolean;
  setIsMouseOver: (value: boolean) => void;

  // Store values
  layout: string;
  isLayouting: boolean;
  addChildNode: any;
  finalizeNodeDeletion: () => void;

  node: NodeProps<T>;
}

export const useMindmapNodeCommon = <T extends BaseNode = BaseNode>({
  node,
}: UseNodeCommonProps<T>): UseNodeCommonReturn<T> => {
  const { id } = node;
  const [isMouseOver, setIsMouseOver] = useState(false);

  // Store hooks
  const addChildNode = useMindmapStore((state) => state.addChildNode);
  const finalizeNodeDeletion = useMindmapStore((state) => state.finalizeNodeDeletion);
  const layout = useLayoutStore((state) => state.layout);
  const isLayouting = useLayoutStore((state) => state.isLayouting);

  // React Flow hooks
  const updateNodeInternals = useUpdateNodeInternals();

  // Effects
  useEffect(() => {
    updateNodeInternals(id);
  }, [layout, isLayouting, id, updateNodeInternals]);

  return {
    // State
    isMouseOver,
    setIsMouseOver,

    // Store values
    layout,
    isLayouting,
    addChildNode,
    finalizeNodeDeletion,

    node: node,
  };
};
