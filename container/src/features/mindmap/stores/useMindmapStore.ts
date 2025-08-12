import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Connection, XYPosition } from '@xyflow/react';
import { type BaseNode, type MindMapEdge, MINDMAP_TYPES } from '../types';
import { DragHandle } from '../constants';
import { generateId } from '@/shared/lib/utils';
import { devtools } from 'zustand/middleware';
import { useClipboardStore } from './useClipboardStore';

const initialNodes: BaseNode[] = [
  // Central root
  {
    id: 'root',
    type: MINDMAP_TYPES.ROOT_NODE,
    position: { x: 400, y: 300 },
    data: { level: 0, content: '<p>Central Topic</p>' },
    dragHandle: DragHandle.SELECTOR,
  },
  // Left side branch (going left from center)
  {
    id: 'left-1',
    type: MINDMAP_TYPES.TEXT_NODE,
    position: { x: 250, y: 300 },
    data: { level: 1, content: '<p>Left Branch</p>', parentId: 'root', side: 'left' },
    dragHandle: DragHandle.SELECTOR,
  },
  {
    id: 'left-4',
    type: MINDMAP_TYPES.SHAPE_NODE,
    position: { x: 150, y: 400 },
    data: {
      level: 2,
      content: '<p>Left Shape Node</p>',
      parentId: 'left-1',
      shape: 'rectangle',

      metadata: {
        fill: 'lightblue',
        stroke: 'blue',
        strokeWidth: 2,
      },
      side: 'left',
    },
    width: 250,
    height: 150,
    dragHandle: DragHandle.SELECTOR,
  },
  //   {
  //     id: 'left-2',
  //     type: 'mindMapNode',
  //     position: { x: 100, y: 250 },
  //     data: { level: 2, content: '<p>Left Sub 1</p>', parentId: 'left-1' },
  //     dragHandle: DragHandle.SELECTOR,
  //   },
  //   {
  //     id: 'left-3',
  //     type: 'mindMapNode',
  //     position: { x: 100, y: 350 },
  //     data: { level: 2, content: '<p>Left Sub 2</p>', parentId: 'left-1' },
  //     dragHandle: DragHandle.SELECTOR,
  //   },
  //   // Right side branch (going right from center)
  //   {
  //     id: 'right-1',
  //     type: 'mindMapNode',
  //     position: { x: 550, y: 300 },
  //     data: { level: 1, content: '<p>Right Branch</p>', parentId: 'root' },
  //     dragHandle: DragHandle.SELECTOR,
  //   },
  //   {
  //     id: 'right-2',
  //     type: 'mindMapNode',
  //     position: { x: 700, y: 250 },
  //     data: { level: 2, content: '<p>Right Sub 1</p>', parentId: 'right-1' },
  //     dragHandle: DragHandle.SELECTOR,
  //   },
  //   {
  //     id: 'right-3',
  //     type: 'mindMapNode',
  //     position: { x: 700, y: 350 },
  //     data: { level: 2, content: '<p>Right Sub 2</p>', parentId: 'right-1' },
  //     dragHandle: DragHandle.SELECTOR,
  //   },
];

const initialEdges: MindMapEdge[] = [
  {
    id: 'e-root-left-1',
    source: 'root',
    target: 'left-1',
    type: MINDMAP_TYPES.EDGE,
    sourceHandle: 'first-source-root',
    targetHandle: 'second-target-left-1',
    data: {
      strokeColor: 'var(--primary)',
      strokeWidth: 2,
    },
  },
  {
    id: 'e-left-1-left-4',
    source: 'left-1',
    target: 'left-4',
    type: MINDMAP_TYPES.EDGE,
    sourceHandle: 'first-source-left-1',
    targetHandle: 'second-target-left-4',
    data: {
      strokeColor: 'var(--primary)',
      strokeWidth: 2,
    },
  },
];

interface MindmapState {
  nodes: BaseNode[];
  edges: MindMapEdge[];
  nodeId: number;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (updater: BaseNode[] | ((nodes: BaseNode[]) => BaseNode[])) => void;
  setEdges: (updater: MindMapEdge[] | ((edges: MindMapEdge[]) => MindMapEdge[])) => void;
  addNode: () => void;
  logData: () => void;
  addChildNode: (parentNode: Partial<BaseNode>, position: XYPosition, side: string) => void;
  updateNodeData: (nodeId: string, updates: Partial<BaseNode['data']>) => void;
  syncState: (updateNodeInternals: any) => void;
  getAllDescendantNodes: (parentId: string) => BaseNode[];
  nodesToBeDeleted: Set<string>;
  deleteSelectedNodes: () => void;
  markNodeForDeletion: (nodeId: string) => void;
  finalizeNodeDeletion: () => void;
}

export const useMindmapStore = create<MindmapState>()(
  devtools((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    nodeId: 1,
    nodesToBeDeleted: new Set<string>(),

    onNodesChange: (changes) => {
      set(
        (state) => ({
          nodes: applyNodeChanges(changes, state.nodes),
        }),
        false,
        'mindmap/onNodesChange'
      );
    },

    onEdgesChange: (changes) => {
      set(
        (state) => ({
          edges: applyEdgeChanges(changes, state.edges),
        }),
        false,
        'mindmap/onEdgesChange'
      );
    },

    onConnect: (connection) => {
      const edge = {
        ...connection,
        type: MINDMAP_TYPES.EDGE,
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
        },
      };
      set(
        (state) => ({
          edges: addEdge(edge, state.edges),
        }),
        false,
        'mindmap/onConnect'
      );
    },

    setNodes: (updater) => {
      set(
        (state) => ({
          nodes: typeof updater === 'function' ? updater(state.nodes) : updater,
        }),
        false,
        'mindmap/setNodes'
      );
    },

    setEdges: (updater) => {
      set(
        (state) => ({
          edges: typeof updater === 'function' ? updater(state.edges) : updater,
        }),
        false,
        'mindmap/setEdges'
      );
    },

    addNode: () => {
      const { nodes, nodeId } = get();
      const newNode: BaseNode = {
        id: generateId(),
        type: MINDMAP_TYPES.TEXT_NODE,
        position: {
          x: Math.random() * 500 + 100,
          y: Math.random() * 400 + 100,
        },
        data: { level: 1, content: `<p>New Node ${nodes.length + 1}</p>` },
      };

      set(
        (state) => ({
          nodes: [...state.nodes, newNode],
          nodeId: nodeId + 1,
        }),
        false,
        'mindmap/addNode'
      );
    },

    addChildNode: (parentNode: Partial<BaseNode>, position: XYPosition, side: string) => {
      const pushUndo = useClipboardStore.getState().pushToUndoStack;
      pushUndo(get().nodes, get().edges);

      const newNode: BaseNode = {
        id: generateId(),
        type: MINDMAP_TYPES.TEXT_NODE,
        data: {
          level: parentNode.data?.level ? parentNode.data.level + 1 : 1,
          content: '<p>New Node</p>',
          parentId: parentNode.id,
          side: side,
        },
        dragHandle: DragHandle.SELECTOR,
        position,
      };

      const newEdge = {
        id: generateId(),
        source: parentNode.id!,
        target: newNode.id,
        type: MINDMAP_TYPES.EDGE,
        sourceHandle: side === 'left' ? `first-source-${parentNode.id}` : `second-source-${parentNode.id}`,
        targetHandle: side === 'left' ? `second-target-${newNode.id}` : `first-target-${newNode.id}`,
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
        },
      };

      set(
        (state) => ({
          nodes: [...state.nodes, newNode],
          edges: [...state.edges, newEdge],
        }),
        false,
        'mindmap/addChildNode'
      );
    },

    updateNodeData: (nodeId: string, updates: Partial<BaseNode['data']>) => {
      set(
        (state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node
          ),
        }),
        false,
        'mindmap/updateNodeData'
      );
    },

    logData: () => {
      const { nodes, edges } = get();
      console.log('Nodes:', nodes);
      console.log('Edges:', edges);
    },

    getAllDescendantNodes: (parentId: string): BaseNode[] => {
      const { nodes } = get();
      return nodes.reduce((acc: BaseNode[], node: BaseNode) => {
        if (node.data.parentId === parentId) {
          acc.push(node);
          acc.push(...get().getAllDescendantNodes(node.id));
        }
        return acc;
      }, []);
    },

    markNodeForDeletion: (nodeId: string) => {
      const descendantNodes = get().getAllDescendantNodes(nodeId);
      const nodeIdsToDelete = new Set([nodeId, ...descendantNodes.map((n) => n.id)]);

      set(
        (state) => ({
          nodesToBeDeleted: nodeIdsToDelete,
          nodes: state.nodes.map((node: BaseNode) =>
            nodeIdsToDelete.has(node.id) ? { ...node, data: { ...node.data, isDeleting: true } } : node
          ),
          edges: state.edges.map((edge: MindMapEdge) =>
            nodeIdsToDelete.has(edge.source) || nodeIdsToDelete.has(edge.target)
              ? { ...edge, data: { ...edge.data, isDeleting: true } }
              : edge
          ),
        }),
        false,
        'mindmap/markNodeForDeletion'
      );
    },

    finalizeNodeDeletion: () => {
      const { nodesToBeDeleted } = get();
      if (nodesToBeDeleted.size === 0) return;
      const pushUndo = useClipboardStore.getState().pushToUndoStack;
      pushUndo(useMindmapStore.getState().nodes, useMindmapStore.getState().edges);

      set(
        (state) => ({
          nodes: state.nodes.filter((node: BaseNode) => !nodesToBeDeleted.has(node.id)),
          edges: state.edges.filter(
            (edge: MindMapEdge) => !nodesToBeDeleted.has(edge.source) && !nodesToBeDeleted.has(edge.target)
          ),
          nodesToBeDeleted: new Set<string>(),
        }),
        false,
        'mindmap/finalizeNodeDeletion'
      );
    },

    deleteSelectedNodes: () => {
      const { nodes, markNodeForDeletion } = get();
      const selectedNodeIds = nodes.filter((node) => node.selected).map((node) => node.id);
      selectedNodeIds.forEach((nodeId) => markNodeForDeletion(nodeId));
    },

    syncState: (updateNodeInternals: any) => {
      const { nodes } = get();
      updateNodeInternals(nodes.map((node) => node.id));
    },
  }))
);
