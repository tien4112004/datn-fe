import type { Node, Edge } from '@xyflow/react';
import type { Direction, MindMapTypes } from '../constants';

export type MindMapNode = Node<{
  level: number;
  content: string;
  isDeleting?: boolean;
  parentId?: string;
  metadata?: Record<string, any>;
}> & {
  type: MindMapTypes;
};

export type MindMapRootNode = MindMapNode & {
  //
};

export type MindMapEdge = Edge<{
  strokeWidth?: number;
  strokeColor?: string;
  smoothType?: 'smoothstep' | 'straight' | 'bezier' | 'simplebezier';
  isDeleting?: boolean;
}>;

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
