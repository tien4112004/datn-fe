import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Connection, XYPosition } from '@xyflow/react';
import type { MindMapNode, MindMapEdge } from '../types';
import { DragHandle, MINDMAP_TYPES } from '../constants';
import { generateId } from '@/shared/lib/utils';

const initialNodes: MindMapNode[] = [
  {
    id: '1',
    type: 'mindMapNode',
    position: { x: 400, y: 300 },
    data: { level: 0, content: '<p>Central Idea</p>' },
    dragHandle: DragHandle.SELECTOR,
  },
];

const initialEdges: MindMapEdge[] = [];

interface MindmapState {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  nodeId: number;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (updater: MindMapNode[] | ((nodes: MindMapNode[]) => MindMapNode[])) => void;
  setEdges: (updater: MindMapEdge[] | ((edges: MindMapEdge[]) => MindMapEdge[])) => void;
  addNode: () => void;
  addChildNode: (parentNode: Partial<MindMapNode>, position: XYPosition, sourceHandler?: string) => void;
  markNodeForDeletion: (nodeId: string) => void;
  finalizeNodeDeletion: (nodeId: string) => void;
  deleteSelectedNodes: () => void;
}

export const useMindmapStore = create<MindmapState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  nodeId: 1,

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    const edge = {
      ...connection,
      type: MINDMAP_TYPES.MINDMAP_EDGE,
      data: {
        strokeColor: 'var(--primary)',
        strokeWidth: 2,
      },
    };
    set((state) => ({
      edges: addEdge(edge, state.edges),
    }));
  },

  setNodes: (updater) => {
    set((state) => ({
      nodes: typeof updater === 'function' ? updater(state.nodes) : updater,
    }));
  },

  setEdges: (updater) => {
    set((state) => ({
      edges: typeof updater === 'function' ? updater(state.edges) : updater,
    }));
  },

  addNode: () => {
    const { nodes, nodeId } = get();
    const newNode: MindMapNode = {
      id: generateId(),
      type: MINDMAP_TYPES.MINDMAP_NODE,
      position: {
        x: Math.random() * 500 + 100,
        y: Math.random() * 400 + 100,
      },
      data: { level: 1, content: `<p>New Node ${nodes.length + 1}</p>` },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      nodeId: nodeId + 1,
    }));
  },

  addChildNode: (parentNode: Partial<MindMapNode>, position: XYPosition, sourceHandler?: string) => {
    const newNode: MindMapNode = {
      id: generateId(),
      type: MINDMAP_TYPES.MINDMAP_NODE,
      data: {
        level: parentNode.data?.level ? parentNode.data.level + 1 : 1,
        content: '<p>New Node</p>',
        parentId: parentNode.id,
      },
      dragHandle: DragHandle.SELECTOR,
      position,
    };

    const newEdge = {
      id: generateId(),
      source: parentNode.id!,
      target: newNode.id,
      type: MINDMAP_TYPES.MINDMAP_EDGE,
      sourceHandle: sourceHandler,
      targetHandle: sourceHandler?.startsWith('left')
        ? `second-target-${newNode.id}`
        : `first-target-${newNode.id}`,
      data: {
        strokeColor: 'var(--primary)',
        strokeWidth: 2,
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      edges: [...state.edges, newEdge],
    }));
  },

  markNodeForDeletion: (nodeId: string) => {
    set((state) => ({
      nodes: state.nodes.map((node: MindMapNode) =>
        node.id === nodeId ? { ...node, data: { ...node.data, isDeleting: true } } : node
      ),
    }));
  },

  finalizeNodeDeletion: (nodeId: string) => {
    set((state) => ({
      nodes: state.nodes.filter((node: MindMapNode) => node.id !== nodeId),
      edges: state.edges.filter((edge: MindMapEdge) => edge.source !== nodeId && edge.target !== nodeId),
    }));
  },

  deleteSelectedNodes: () => {
    const { nodes, markNodeForDeletion } = get();
    const selectedNodeIds = nodes.filter((node) => node.selected).map((node) => node.id);
    selectedNodeIds.forEach((nodeId) => markNodeForDeletion(nodeId));
  },
}));
