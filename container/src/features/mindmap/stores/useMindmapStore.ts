import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Connection, XYPosition } from '@xyflow/react';
import { type MindMapNode, type MindMapEdge, MINDMAP_TYPES } from '../types';
import { DragHandle } from '../types/constants';
import { generateId } from '@/shared/lib/utils';
import { devtools } from 'zustand/middleware';
import { useClipboardStore } from './useClipboardStore';
import { getAllDescendantNodes } from '../services/utils';
import { toast } from 'sonner';

const initialNodes: MindMapNode[] = [
  // Central root
  {
    id: 'root',
    type: MINDMAP_TYPES.ROOT_NODE,
    position: { x: 0, y: 0 },
    data: { level: 0, content: '<p>Central Topic</p>', side: 'mid' },
    dragHandle: DragHandle.SELECTOR,
    width: 250,
    height: 100,
  },
  // Left side branch (going left from center)
  {
    id: 'left-1',
    type: MINDMAP_TYPES.TEXT_NODE,
    position: { x: 250, y: 300 },
    data: { level: 1, content: '<p>Left Branch</p>', parentId: 'root', side: 'left' },
    dragHandle: DragHandle.SELECTOR,
    width: 400,
    height: 80,
  },
  {
    id: 'left-4',
    type: MINDMAP_TYPES.SHAPE_NODE,
    position: { x: 200, y: 400 },
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
    width: 300,
    height: 150,
  },
  {
    id: 'left-2',
    type: MINDMAP_TYPES.TEXT_NODE,
    position: { x: 200, y: 200 },
    data: { level: 2, content: '<p>Left Child</p>', parentId: 'left-1', side: 'left' },
    dragHandle: DragHandle.SELECTOR,
    width: 150,
    height: 60,
  },
  {
    id: 'right-1',
    type: MINDMAP_TYPES.TEXT_NODE,
    position: { x: 550, y: 300 },
    data: { level: 1, content: '<p>Right Branch</p>', parentId: 'root', side: 'right' },
    dragHandle: DragHandle.SELECTOR,
    width: 200,
    height: 80,
  },
  {
    id: 'right-2',
    type: MINDMAP_TYPES.TEXT_NODE,
    position: { x: 600, y: 200 },
    data: { level: 2, content: '<p>Right Child</p>', parentId: 'right-1', side: 'right' },
    dragHandle: DragHandle.SELECTOR,
    width: 500,
    height: 60,
  },
  {
    id: 'right-3',
    type: MINDMAP_TYPES.SHAPE_NODE,
    position: { x: 600, y: 400 },
    data: {
      level: 2,
      content: '<p>Right Shape Node</p>',
      parentId: 'right-1',
      shape: 'circle',
      side: 'right',
    },
    width: 180,
    height: 150,
  },
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
  {
    id: 'e-left-1-left-2',
    source: 'left-1',
    target: 'left-2',
    type: MINDMAP_TYPES.EDGE,
    sourceHandle: 'first-source-left-1',
    targetHandle: 'second-target-left-2',
    data: {
      strokeColor: 'var(--primary)',
      strokeWidth: 2,
    },
  },
  {
    id: 'e-root-right-1',
    source: 'root',
    target: 'right-1',
    type: MINDMAP_TYPES.EDGE,
    sourceHandle: 'second-source-root',
    targetHandle: 'first-target-right-1',
    data: {
      strokeColor: 'var(--primary)',
      strokeWidth: 2,
    },
  },
  {
    id: 'e-right-1-right-2',
    source: 'right-1',
    target: 'right-2',
    type: MINDMAP_TYPES.EDGE,
    sourceHandle: 'second-source-right-1',
    targetHandle: 'first-target-right-2',
    data: {
      strokeColor: 'var(--primary)',
      strokeWidth: 2,
    },
  },
  {
    id: 'e-right-1-right-3',
    source: 'right-1',
    target: 'right-3',
    type: MINDMAP_TYPES.EDGE,
    sourceHandle: 'second-source-right-1',
    targetHandle: 'first-target-right-3',
    data: {
      strokeColor: 'var(--primary)',
      strokeWidth: 2,
    },
  },
];

interface MindmapState {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  getNode: (nodeId: string) => MindMapNode | undefined;
  getNodeLength: () => number;
  setNodes: (updater: MindMapNode[] | ((nodes: MindMapNode[]) => MindMapNode[])) => void;
  setEdges: (updater: MindMapEdge[] | ((edges: MindMapEdge[]) => MindMapEdge[])) => void;
  addNode: () => void;
  logData: () => void;
  addChildNode: (parentNode: Partial<MindMapNode>, position: XYPosition, side: string) => void;
  updateNodeData: (nodeId: string, updates: Partial<MindMapNode['data']>) => void;
  updateNodeDataWithUndo: (nodeId: string, updates: Partial<MindMapNode['data']>) => void;
  syncState: (updateNodeInternals: any) => void;
  nodesToBeDeleted: Set<string>;
  deleteSelectedNodes: () => void;
  markNodeForDeletion: (nodeId: string) => void;
  finalizeNodeDeletion: () => void;
  moveToChild: (sourceId: string, targetId: string, side: 'left' | 'right') => void;
}

export const useMindmapStore = create<MindmapState>()(
  devtools((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
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

    getNodeLength: () => {
      return get().nodes.length;
    },

    addNode: () => {
      const { nodes } = get();
      const newNode: MindMapNode = {
        id: generateId(),
        type: MINDMAP_TYPES.TEXT_NODE,
        position: {
          x: Math.random() * 500 + 100,
          y: Math.random() * 400 + 100,
        },
        data: { level: 1, content: `<p>New Node ${nodes.length + 1}</p>`, side: 'mid' },
      };

      set(
        (state) => ({
          nodes: [...state.nodes, newNode],
        }),
        false,
        'mindmap/addNode'
      );
    },

    addChildNode: (
      parentNode: Partial<MindMapNode>,
      position: XYPosition,
      side: 'left' | 'right' | 'mid'
    ) => {
      const pushUndo = useClipboardStore.getState().pushToUndoStack;
      pushUndo(get().nodes, get().edges);

      const id = generateId();
      const newNode: MindMapNode = {
        id,
        type: MINDMAP_TYPES.TEXT_NODE,
        data: {
          level: parentNode.data?.level ? parentNode.data.level + 1 : 1,
          content: `<p>${id}</p>`,
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

    updateNodeData: (nodeId: string, updates: Partial<MindMapNode['data']>) => {
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

    updateNodeDataWithUndo: (nodeId: string, updates: Partial<MindMapNode['data']>) => {
      const pushUndo = useClipboardStore.getState().pushToUndoStack;
      pushUndo(get().nodes, get().edges);

      set(
        (state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node
          ),
        }),
        false,
        'mindmap/updateNodeDataWithUndo'
      );
    },

    logData: () => {
      const { nodes, edges } = get();
      console.log('Nodes:', nodes);
      console.log('Edges:', edges);
    },

    markNodeForDeletion: (nodeId: string) => {
      const descendantNodes = getAllDescendantNodes(nodeId, get().nodes);
      const nodeIdsToDelete = new Set([nodeId, ...descendantNodes.map((n) => n.id)]);

      set(
        (state) => ({
          nodesToBeDeleted: nodeIdsToDelete,
          nodes: state.nodes.map((node: MindMapNode) =>
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
          nodes: state.nodes.filter((node: MindMapNode) => !nodesToBeDeleted.has(node.id)),
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

    getNode: (nodeId: string) => {
      const { nodes } = get();
      return nodes.find((node) => node.id === nodeId);
    },

    moveToChild: (sourceId: string, targetId: string, side?: 'left' | 'right') => {
      if (sourceId === targetId) return;

      const state = get();
      const { nodes, edges } = state;

      const sourceNode = nodes.find((node) => node.id === sourceId);
      const targetNode = nodes.find((node) => node.id === targetId);

      if (!sourceNode || !targetNode) return;

      const descendantNodes = getAllDescendantNodes(sourceId, nodes);

      if (descendantNodes.some((node) => node.id === targetId)) {
        toast.error('Cannot move a node to one of its descendants.');
        return;
      }

      const pushUndo = useClipboardStore.getState().pushToUndoStack;
      pushUndo(nodes, edges);

      const isTargetRoot = targetNode.data?.level === 0;
      const newSourceLevel = (targetNode.data?.level ?? 0) + 1;
      const oldSourceLevel = sourceNode.data?.level ?? 0;
      const newSide = isTargetRoot ? (side ?? 'left') : targetNode.data?.side;
      const oldSide = sourceNode.data?.side;
      const levelDifference = newSourceLevel - oldSourceLevel;

      const updatedNodes = nodes.map((node) => {
        if (node.id === sourceId) {
          return {
            ...node,
            data: {
              ...node.data,
              parentId: targetId,
              level: newSourceLevel,
              side: newSide,
            },
          };
        }

        if (descendantNodes.some((descendant) => descendant.id === node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              level: node.data.level + levelDifference,
              side: newSide,
            },
          };
        }

        return node;
      });

      const getHandles = (side: string, nodeId: string, isSource: boolean) => {
        const handleType = isSource ? 'source' : 'target';
        const position = side === 'left' ? (isSource ? 'first' : 'second') : isSource ? 'second' : 'first';
        return `${position}-${handleType}-${nodeId}`;
      };

      let isEdgeEstablished = false;
      const updatedEdges = edges.map((edge) => {
        if (edge.target === sourceId) {
          isEdgeEstablished = true;
          return {
            ...edge,
            source: targetId,
            sourceHandle: getHandles(newSide!, targetId, true),
            targetHandle: getHandles(newSide!, edge.target, false),
          };
        }

        if (newSide !== oldSide && descendantNodes.some((descendant) => descendant.id === edge.target)) {
          return {
            ...edge,
            sourceHandle: getHandles(newSide!, edge.source, true),
            targetHandle: getHandles(newSide!, edge.target, false),
          };
        }

        return edge;
      });

      if (!isEdgeEstablished) {
        const newEdge: MindMapEdge = {
          id: generateId(),
          source: targetId,
          target: sourceId,
          type: MINDMAP_TYPES.EDGE,
          sourceHandle: getHandles(newSide!, targetId, true),
          targetHandle: getHandles(newSide!, sourceId, false),
          data: {
            strokeColor: 'var(--primary)',
            strokeWidth: 2,
          },
        };
        updatedEdges.push(newEdge);
      }

      set(
        () => ({
          nodes: updatedNodes,
          edges: updatedEdges,
        }),
        false,
        'mindmap/moveToChild'
      );
    },
  }))
);
