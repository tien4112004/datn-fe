import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Connection, XYPosition } from '@xyflow/react';
import { type BaseMindMapNode, type MindMapEdge, MINDMAP_TYPES } from '../types';
import { DragHandle } from '../constants';
import { generateId } from '@/shared/lib/utils';
import { devtools } from 'zustand/middleware';
import { useClipboardStore } from './useClipboardStore';

const initialNodes: BaseMindMapNode[] = [
  {
    id: 'left-4',
    type: MINDMAP_TYPES.MINDMAP_SHAPE_NODE,
    position: { x: 150, y: 400 },
    data: {
      level: 2,
      content: '<p>Left Shape Node</p>',
      parentId: 'left-1',
      shape: 'rectangle',
      width: 200,
      height: 100,
      metadata: {
        fill: 'lightblue',
        stroke: 'blue',
        strokeWidth: 2,
      },
    },
  },

  //   // Central root
  //   {
  //     id: 'root',
  //     type: 'mindMapRootNode',
  //     position: { x: 400, y: 300 },
  //     data: { level: 0, content: '<p>Central Topic</p>' },
  //     dragHandle: DragHandle.SELECTOR,
  //   },
  //   // Left side branch (going left from center)
  //   {
  //     id: 'left-1',
  //     type: 'mindMapNode',
  //     position: { x: 250, y: 300 },
  //     data: { level: 1, content: '<p>Left Branch</p>', parentId: 'root' },
  //     dragHandle: DragHandle.SELECTOR,
  //   },
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
  //   // Left side connections
  //   {
  //     id: 'root-left-1',
  //     source: 'root',
  //     target: 'left-1',
  //     type: MINDMAP_TYPES.MINDMAP_EDGE,
  //     data: { strokeColor: 'var(--primary)', strokeWidth: 2 },
  //   },
  //   {
  //     id: 'left-1-left-2',
  //     source: 'left-1',
  //     target: 'left-2',
  //     type: MINDMAP_TYPES.MINDMAP_EDGE,
  //     data: { strokeColor: 'var(--primary)', strokeWidth: 2 },
  //   },
  //   {
  //     id: 'left-1-left-3',
  //     source: 'left-1',
  //     target: 'left-3',
  //     type: MINDMAP_TYPES.MINDMAP_EDGE,
  //     data: { strokeColor: 'var(--primary)', strokeWidth: 2 },
  //   },
  //   // Right side connections
  //   {
  //     id: 'root-right-1',
  //     source: 'root',
  //     target: 'right-1',
  //     type: MINDMAP_TYPES.MINDMAP_EDGE,
  //     data: { strokeColor: 'var(--primary)', strokeWidth: 2 },
  //   },
  //   {
  //     id: 'right-1-right-2',
  //     source: 'right-1',
  //     target: 'right-2',
  //     type: MINDMAP_TYPES.MINDMAP_EDGE,
  //     data: { strokeColor: 'var(--primary)', strokeWidth: 2 },
  //   },
  //   {
  //     id: 'right-1-right-3',
  //     source: 'right-1',
  //     target: 'right-3',
  //     type: MINDMAP_TYPES.MINDMAP_EDGE,
  //     data: { strokeColor: 'var(--primary)', strokeWidth: 2 },
  //   },
];

interface MindmapState {
  nodes: BaseMindMapNode[];
  edges: MindMapEdge[];
  nodeId: number;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (updater: BaseMindMapNode[] | ((nodes: BaseMindMapNode[]) => BaseMindMapNode[])) => void;
  setEdges: (updater: MindMapEdge[] | ((edges: MindMapEdge[]) => MindMapEdge[])) => void;
  addNode: () => void;
  logData: () => void;
  addChildNode: (parentNode: Partial<BaseMindMapNode>, position: XYPosition, sourceHandler?: string) => void;
  updateNodeData: (nodeId: string, updates: Partial<BaseMindMapNode['data']>) => void;
  syncState: (updateNodeInternals: any) => void;
  getAllDescendantNodes: (parentId: string) => BaseMindMapNode[];
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
        type: MINDMAP_TYPES.MINDMAP_EDGE,
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
      const newNode: BaseMindMapNode = {
        id: generateId(),
        type: MINDMAP_TYPES.MINDMAP_TEXT_NODE,
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

    addChildNode: (parentNode: Partial<BaseMindMapNode>, position: XYPosition, sourceHandler?: string) => {
      const pushUndo = useClipboardStore.getState().pushToUndoStack;
      pushUndo(get().nodes, get().edges);
      const newNode: BaseMindMapNode = {
        id: generateId(),
        type: MINDMAP_TYPES.MINDMAP_TEXT_NODE,
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

      set(
        (state) => ({
          nodes: [...state.nodes, newNode],
          edges: [...state.edges, newEdge],
        }),
        false,
        'mindmap/addChildNode'
      );
    },

    updateNodeData: (nodeId: string, updates: Partial<BaseMindMapNode['data']>) => {
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

    getAllDescendantNodes: (parentId: string): BaseMindMapNode[] => {
      const { nodes } = get();
      return nodes.reduce((acc: BaseMindMapNode[], node: BaseMindMapNode) => {
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
          nodes: state.nodes.map((node: BaseMindMapNode) =>
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
          nodes: state.nodes.filter((node: BaseMindMapNode) => !nodesToBeDeleted.has(node.id)),
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
