import { Position } from '@xyflow/react';
import type { MindMapNode, Side } from '../types';
import { MINDMAP_TYPES, SIDE } from '../types';

export const getAllDescendantNodes = (parentId: string, nodes: MindMapNode[]): MindMapNode[] => {
  return nodes.reduce((acc: MindMapNode[], node: MindMapNode) => {
    if (node.data.parentId === parentId) {
      acc.push(node);
      acc.push(...getAllDescendantNodes(node.id, nodes));
    }
    return acc;
  }, []);
};

export const getRootNodeOfSubtree = (nodeId: string, nodes: MindMapNode[]): MindMapNode | null => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  if (node.type === MINDMAP_TYPES.ROOT_NODE) {
    return node;
  }

  if (!node.data.parentId) {
    return null;
  }

  return getRootNodeOfSubtree(node.data.parentId, nodes);
};

export const getSideFromPosition = (position: Position): Side => {
  switch (position) {
    case Position.Left:
      return SIDE.LEFT;
    case Position.Right:
      return SIDE.RIGHT;
    case Position.Top:
      return SIDE.LEFT;
    case Position.Bottom:
      return SIDE.RIGHT;
    default:
      throw new Error(`Unknown position: ${position}`);
  }
};

export const getOppositePosition = (position: Position): Position => {
  switch (position) {
    case Position.Left:
      return Position.Right;
    case Position.Right:
      return Position.Left;
    case Position.Top:
      return Position.Bottom;
    case Position.Bottom:
      return Position.Top;
    default:
      throw new Error(`Unknown position: ${position}`);
  }
};
