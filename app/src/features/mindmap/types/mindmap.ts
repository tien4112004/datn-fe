import type { Node, Edge } from '@xyflow/react';
import type { MINDMAP_TYPES, PATH_TYPES, SHAPES, SIDE, POSITION, LAYOUT_TYPE } from './constants';
import type { Permission } from '../../../shared/utils/permission';

export type MindMapTypes = (typeof MINDMAP_TYPES)[keyof typeof MINDMAP_TYPES];
export type PathType = (typeof PATH_TYPES)[keyof typeof PATH_TYPES];
export type Shape = (typeof SHAPES)[keyof typeof SHAPES];
export type Side = (typeof SIDE)[keyof typeof SIDE];
export type Position = (typeof POSITION)[keyof typeof POSITION];
export type LayoutType = (typeof LAYOUT_TYPE)[keyof typeof LAYOUT_TYPE];

export interface BaseNodeData extends Record<string, unknown> {
  level: number;
  isDeleting?: boolean;
  collapsedBy?: string;
  parentId?: string;
  metadata?: Record<string, any>;
  side: Side;
  /**
   * Determines the order of this node among its siblings.
   * Lower values appear earlier in the layout (top for horizontal, left for vertical).
   * When undefined, nodes are ordered by their array index.
   */
  siblingOrder?: number;
  collapsedChildren?: {
    leftNodes: BaseNode[];
    leftEdges: MindMapEdge[];
    rightNodes: BaseNode[];
    rightEdges: MindMapEdge[];
  };
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
  pathType?: PathType;
  edgeColor?: string;
  /** The layout type used for arranging nodes in this tree */
  layoutType?: LayoutType;
  /** Whether to force auto-layout on changes for this tree */
  forceLayout?: boolean;
}

export interface RootNode extends BaseNode<RootNodeData, typeof MINDMAP_TYPES.ROOT_NODE> {}

/**
 * @deprecated ShapeNode is deprecated and will be removed in a future version.
 * Please use TextNode or other alternative node types instead.
 */
interface ShapeNodeData extends BaseNodeData {
  shape?: 'rectangle' | 'circle' | 'ellipse';
  width?: number;
  height?: number;
}

/**
 * @deprecated ShapeNode is deprecated and will be removed in a future version.
 * Please use TextNode or other alternative node types instead.
 */
export interface ShapeNode extends BaseNode<ShapeNodeData, typeof MINDMAP_TYPES.SHAPE_NODE> {}

/**
 * @deprecated ImageNode is deprecated and will be removed in a future version.
 * Please use TextNode or other alternative node types instead.
 */
interface ImageNodeData extends BaseNodeData {
  imageUrl?: string;
  imageFile?: File;
  isLoading?: boolean;
  alt?: string;
  width?: number;
  height?: number;
}

/**
 * @deprecated ImageNode is deprecated and will be removed in a future version.
 * Please use TextNode or other alternative node types instead.
 */
export interface ImageNode extends BaseNode<ImageNodeData, typeof MINDMAP_TYPES.IMAGE_NODE> {}

export type MindMapEdge = Edge<{
  strokeWidth?: number;
  strokeColor?: string;
  pathType?: PathType;
  isDeleting?: boolean;
  isCollapsed?: boolean;
}>;

export type NodeData = TextNodeData | RootNodeData | ShapeNodeData | ImageNodeData;
export type MindMapNode = TextNode | RootNode | ShapeNode | ImageNode | BaseNode;

export type AiGeneratedNode = {
  /** @deprecated Use `content` instead */
  data?: string;
  /** New AI response format uses `content` */
  content?: string;
  children?: AiGeneratedNode[];
};

export interface MindmapActionsType {
  selectAllHandler: () => void;
  deselectAllHandler: () => void;
  copyHandler: () => void;
  pasteHandler: () => void;
  deleteHandler: () => void;
}

export interface MindmapLayoutType {
  updateLayout: (layoutType: LayoutType) => void;
  onLayoutChange: (layoutType: LayoutType) => void;
}

export interface MindmapMetadata {
  /** The layout type used for arranging nodes */
  layoutType?: LayoutType;
  forceLayout?: boolean;
  /** Saved viewport state (zoom and position) */
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  [key: string]: unknown;
}

export interface Mindmap {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  metadata?: MindmapMetadata;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  createdAt: string;
  updatedAt: string;
  permission?: Permission;
}
