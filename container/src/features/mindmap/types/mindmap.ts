import type { Node, Edge } from '@xyflow/react';
import type { Direction, MINDMAP_TYPES, Side, SMOOTH_TYPES } from './constants';

export type MindMapTypes = (typeof MINDMAP_TYPES)[keyof typeof MINDMAP_TYPES];
export type SmoothType = (typeof SMOOTH_TYPES)[keyof typeof SMOOTH_TYPES];

export interface BaseNodeData extends Record<string, unknown> {
  level: number;
  isDeleting?: boolean;
  isCollapsed: boolean;
  parentId?: string;
  metadata?: Record<string, any>;
  side: Side;
  isLeftChildrenCollapsed?: boolean;
  isRightChildrenCollapsed?: boolean;
}

export type BaseNode<
  TData extends BaseNodeData = BaseNodeData,
  TType extends MindMapTypes = MindMapTypes,
> = Node<TData> & {
  type: TType;
};

export interface TextNodeData extends BaseNodeData {
  content: string;
}

export interface TextNode extends BaseNode<TextNodeData, typeof MINDMAP_TYPES.TEXT_NODE> {}

export interface RootNodeData extends BaseNodeData {
  content: string;
  smoothType?: SmoothType;
}

export interface RootNode extends BaseNode<RootNodeData, typeof MINDMAP_TYPES.ROOT_NODE> {}

interface ShapeNodeData extends BaseNodeData {
  shape?: 'rectangle' | 'circle' | 'ellipse';
  width?: number;
  height?: number;
}

export interface ShapeNode extends BaseNode<ShapeNodeData, typeof MINDMAP_TYPES.SHAPE_NODE> {}

interface ImageNodeData extends BaseNodeData {
  imageUrl?: string;
  imageFile?: File;
  isLoading?: boolean;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ImageNode extends BaseNode<ImageNodeData, typeof MINDMAP_TYPES.IMAGE_NODE> {}

export type MindMapEdge = Edge<{
  strokeWidth?: number;
  strokeColor?: string;
  smoothType?: SmoothType;
  isDeleting?: boolean;
  isCollapsed?: boolean;
}>;

export type NodeData = TextNodeData | RootNodeData | ShapeNodeData | ImageNodeData;
export type MindMapNode = TextNode | RootNode | ShapeNode | ImageNode | BaseNode;

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
