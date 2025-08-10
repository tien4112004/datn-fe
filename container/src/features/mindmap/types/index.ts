import type { Node, Edge, XYPosition, Connection } from '@xyflow/react';
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

export type MindMapEdge = Edge<{
  strokeWidth?: number;
  strokeColor?: string;
  smoothType?: 'smoothstep' | 'straight' | 'bezier' | 'simplebezier';
  isLayouting?: boolean;
}>;

export interface MindmapContextType {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  setNodes: React.Dispatch<React.SetStateAction<MindMapNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<MindMapEdge[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: MindMapEdge | Connection) => void;
  onNodeDrag: (event: MouseEvent, node: MindMapNode) => void;
  addNode: () => void;
  deleteSelectedNodes: () => void;
  addChildNode: (parentNode: Partial<MindMapNode>, position: XYPosition, sourceHandler?: string) => void;
  markNodeForDeletion: (nodeId: string) => void;
  finalizeNodeDeletion: (nodeId: string) => void;
}

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
