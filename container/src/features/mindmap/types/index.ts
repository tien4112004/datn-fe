import type { Node, Edge, XYPosition, Connection } from '@xyflow/react';
import type { MindMapTypes } from '../constants';

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
}>;

export interface MindmapContextType {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  setNodes: React.Dispatch<React.SetStateAction<MindMapNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<MindMapEdge[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: MindMapEdge | Connection) => void;
  onMouseMove: (event: any) => void;
  onNodeDrag: (event: MouseEvent, node: MindMapNode) => void;
  updateLayout: (direction: 'horizontal' | 'vertical' | '') => void;
  onLayoutChange: (direction: 'horizontal' | 'vertical' | '') => void;
  addNode: () => void;
  deleteSelectedNodes: () => void;
  addChildNode: (parentNode: Partial<MindMapNode>, position: XYPosition, sourceHandler?: string) => void;
  markNodeForDeletion: (nodeId: string) => void;
  finalizeNodeDeletion: (nodeId: string) => void;
  selectAllNodesAndEdges: () => void;
  deselectAllNodesAndEdges: () => void;
  copySelectedNodesAndEdges: () => void;
  pasteClonedNodesAndEdges: () => void;
}
