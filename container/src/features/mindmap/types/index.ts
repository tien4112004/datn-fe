import type { Node, Edge } from '@xyflow/react';
import type { Direction } from '../constants';

export const MINDMAP_TYPES = {
  MINDMAP_TEXT_NODE: 'mindMapNode',
  MINDMAP_ROOT_NODE: 'mindMapRootNode',
  MINDMAP_EDGE: 'mindmapEdge',
  MINDMAP_SHAPE_NODE: 'mindmapShapeNode',
} as const;

export const SMOOTH_TYPES = {
  SMOOTHSTEP: 'smoothstep',
  STRAIGHT: 'straight',
  BEZIER: 'bezier',
  SIMPLE_BEZIER: 'simplebezier',
} as const;

export type MindMapTypes = (typeof MINDMAP_TYPES)[keyof typeof MINDMAP_TYPES];
export type SmoothType = (typeof SMOOTH_TYPES)[keyof typeof SMOOTH_TYPES];

export interface BaseMindMapNodeData extends Record<string, unknown> {
  level: number;
  isDeleting?: boolean;
  parentId?: string;
  metadata?: Record<string, any>;
}

export type BaseMindMapNode<
  TData extends BaseMindMapNodeData = BaseMindMapNodeData,
  TType extends MindMapTypes = MindMapTypes,
> = Node<TData> & {
  type: TType;
};

export interface MindMapTextNodeData extends BaseMindMapNodeData {
  content: string;
}

export interface MindMapTextNode
  extends BaseMindMapNode<MindMapTextNodeData, typeof MINDMAP_TYPES.MINDMAP_TEXT_NODE> {
  content: string;
}

export interface MindMapRootNodeData extends BaseMindMapNodeData {
  content: string;
}

export interface MindMapRootNode
  extends BaseMindMapNode<MindMapRootNodeData, typeof MINDMAP_TYPES.MINDMAP_ROOT_NODE> {
  content: string;
}

interface MindMapShapeNodeData extends BaseMindMapNodeData {
  shape?: 'rectangle' | 'circle' | 'ellipse';
  width?: number;
  height?: number;
}

export interface MindMapShapeNode
  extends BaseMindMapNode<MindMapShapeNodeData, typeof MINDMAP_TYPES.MINDMAP_SHAPE_NODE> {}

export type MindMapEdge = Edge<{
  strokeWidth?: number;
  strokeColor?: string;
  smoothType?: SmoothType;
  isDeleting?: boolean;
}>;

export type NodeData = MindMapTextNodeData | MindMapRootNodeData | MindMapShapeNodeData;
export type MindMapNode = MindMapTextNode | MindMapRootNode | MindMapShapeNode;

export interface MindmapActionsType {
  selectAllNodesAndEdges: () => void;
  deselectAllNodesAndEdges: () => void;
  copySelectedNodesAndEdges: () => void;
  pasteClonedNodesAndEdges: () => void;
  deleteSelectedNodes: () => void;
}

export interface MindmapLayoutType {
  updateLayout: (direction: Direction) => void;
  onLayoutChange: (direction: Direction) => void;
}
