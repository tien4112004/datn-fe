import type { Node, Edge } from '@xyflow/react';
import type { Direction } from '../constants';

export const MINDMAP_TYPES = {
  TEXT_NODE: 'mindMapNode',
  ROOT_NODE: 'mindMapRootNode',
  EDGE: 'mindmapEdge',
  SHAPE_NODE: 'mindmapShapeNode',
} as const;

export const SMOOTH_TYPES = {
  SMOOTHSTEP: 'smoothstep',
  STRAIGHT: 'straight',
  BEZIER: 'bezier',
  SIMPLE_BEZIER: 'simplebezier',
} as const;

export type MindMapTypes = (typeof MINDMAP_TYPES)[keyof typeof MINDMAP_TYPES];
export type SmoothType = (typeof SMOOTH_TYPES)[keyof typeof SMOOTH_TYPES];

export interface BaseNodeData extends Record<string, unknown> {
  level: number;
  isDeleting?: boolean;
  parentId?: string;
  metadata?: Record<string, any>;
}

export type BaseNode<
  TData extends BaseNodeData = BaseNodeData,
  TType extends MindMapTypes = MindMapTypes,
> = Node<TData> & {
  type: TType;
};

export interface TextNodeData extends BaseNodeData {
  content: string;
  side: 'left' | 'right';
}

export interface TextNode extends BaseNode<TextNodeData, typeof MINDMAP_TYPES.TEXT_NODE> {}

export interface RootNodeData extends BaseNodeData {
  content: string;
}

export interface RootNode extends BaseNode<RootNodeData, typeof MINDMAP_TYPES.ROOT_NODE> {}

interface ShapeNodeData extends BaseNodeData {
  shape?: 'rectangle' | 'circle' | 'ellipse';
  width?: number;
  height?: number;
  side: 'left' | 'right';
}

export interface ShapeNode extends BaseNode<ShapeNodeData, typeof MINDMAP_TYPES.SHAPE_NODE> {}

export type MindMapEdge = Edge<{
  strokeWidth?: number;
  strokeColor?: string;
  smoothType?: SmoothType;
  isDeleting?: boolean;
}>;

export type NodeData = TextNodeData | RootNodeData | ShapeNodeData;
export type MindMapNode = TextNode | RootNode | ShapeNode;

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
