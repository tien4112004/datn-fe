import { useState, useEffect } from 'react';
import { useNodeConnections, useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import { useMindmapStore } from '../stores/useMindmapStore';
import { useLayoutStore } from '../stores/useLayoutStore';
import type { BaseMindMapNode } from '../types';

export interface UseMindmapNodeCommonProps<T extends BaseMindMapNode = BaseMindMapNode> {
  node: NodeProps<T>;
}

export interface UseMindmapNodeCommonReturn<T extends BaseMindMapNode = BaseMindMapNode> {
  // State
  isMouseOver: boolean;
  setIsMouseOver: (value: boolean) => void;

  // Store values
  layout: string;
  isLayouting: boolean;
  addChildNode: any;
  finalizeNodeDeletion: () => void;

  // Connection logic
  connections: any[];
  canCreateLeft: boolean;
  canCreateRight: boolean;
  node: NodeProps<T>;
}

export const useMindmapNodeCommon = <T extends BaseMindMapNode = BaseMindMapNode>({
  node,
}: UseMindmapNodeCommonProps<T>): UseMindmapNodeCommonReturn<T> => {
  const { id } = node;
  const [isMouseOver, setIsMouseOver] = useState(false);

  // Store hooks
  const addChildNode = useMindmapStore((state) => state.addChildNode);
  const finalizeNodeDeletion = useMindmapStore((state) => state.finalizeNodeDeletion);
  const layout = useLayoutStore((state) => state.layout);
  const isLayouting = useLayoutStore((state) => state.isLayouting);

  // React Flow hooks
  const updateNodeInternals = useUpdateNodeInternals();
  const connections = useNodeConnections({ id });

  // Effects
  useEffect(() => {
    updateNodeInternals(id);
  }, [layout, isLayouting, id, updateNodeInternals]);

  // Connection logic
  const canCreateLeft =
    !connections.some(
      (conn) => conn.sourceHandle === `first-source-${id}` || conn.targetHandle === `first-target-${id}`
    ) || node.data.level === 0;

  const canCreateRight = true; // Temporarily allow right connections for simplicity

  return {
    // State
    isMouseOver,
    setIsMouseOver,

    // Store values
    layout,
    isLayouting,
    addChildNode,
    finalizeNodeDeletion,

    // Connection logic
    connections,
    canCreateLeft,
    canCreateRight,

    node: node,
  };
};
