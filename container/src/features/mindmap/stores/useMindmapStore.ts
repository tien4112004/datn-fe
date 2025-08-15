import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Connection, XYPosition } from '@xyflow/react';
import {
  type MindMapNode,
  type MindMapEdge,
  MINDMAP_TYPES,
  type MindMapTypes,
  type SmoothType,
  SMOOTH_TYPES,
} from '../types';
import { DragHandle, SIDE, type Side } from '../types/constants';
import { generateId } from '@/shared/lib/utils';
import { devtools } from 'zustand/middleware';
import { useClipboardStore } from './useClipboardStore';
import { getAllDescendantNodes, getRootNodeOfSubtree } from '../services/utils';
import { toast } from 'sonner';

const initialNodes: MindMapNode[] = [
  // Central root
  {
    id: 'root',
    type: MINDMAP_TYPES.ROOT_NODE,
    position: { x: 0, y: 0 },
    data: {
      level: 0,
      content: '<p>Central Topic</p>',
      side: SIDE.MID,
      isCollapsed: false,
      smoothType: SMOOTH_TYPES.SMOOTHSTEP,
    },
    dragHandle: DragHandle.SELECTOR,
    width: 250,
    height: 100,
  },
  // Left side branch (going left from center)
  {
    id: 'left-1',
    type: MINDMAP_TYPES.TEXT_NODE,
    position: { x: 250, y: 300 },
    data: { level: 1, content: '<p>Left Branch</p>', parentId: 'root', side: SIDE.LEFT, isCollapsed: false },
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
      side: SIDE.LEFT,
      isCollapsed: false,
    },
    width: 300,
    height: 150,
  },
  {
    id: 'left-2',
    type: MINDMAP_TYPES.TEXT_NODE,
    position: { x: 200, y: 200 },
    data: { level: 2, content: '<p>Left Child</p>', parentId: 'left-1', side: SIDE.LEFT, isCollapsed: false },
    dragHandle: DragHandle.SELECTOR,
    width: 150,
    height: 60,
  },
  {
    id: 'right-1',
    type: MINDMAP_TYPES.TEXT_NODE,
    position: { x: 550, y: 300 },
    data: {
      level: 1,
      content: '<p>Right Branch</p>',
      parentId: 'root',
      side: SIDE.RIGHT,
      isCollapsed: false,
    },
    dragHandle: DragHandle.SELECTOR,
    width: 200,
    height: 80,
  },
  {
    id: 'right-2',
    type: MINDMAP_TYPES.TEXT_NODE,
    position: { x: 600, y: 200 },
    data: {
      level: 2,
      content: '<p>Right Child</p>',
      parentId: 'right-1',
      side: SIDE.RIGHT,
      isCollapsed: false,
    },
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
      side: SIDE.RIGHT,
      isCollapsed: false,
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
  hasLeftChildren: (nodeId: string) => boolean;
  hasRightChildren: (nodeId: string) => boolean;
  addNode: () => void;
  logData: () => void;
  addChildNode: (
    parentNode: Partial<MindMapNode>,
    position: XYPosition,
    side: string,
    nodeType?: MindMapTypes
  ) => void;
  updateNodeDataWithUndo: (nodeId: string, updates: Partial<MindMapNode['data']>) => void;
  syncState: (updateNodeInternals: any) => void;
  nodesToBeDeleted: Set<string>;
  deleteSelectedNodes: () => void;
  markNodeForDeletion: (nodeId: string) => void;
  finalizeNodeDeletion: () => void;
  collapse: (nodeId: string, side: Side) => void;
  expand: (nodeId: string, side: Side) => void;
  toggleCollapse: (nodeId: string, side: Side, shouldCollapse: boolean) => void;
  moveToChild: (sourceId: string, targetId: string, side: Side) => void;
  updateSubtreeEdgeSmoothType: (rootNodeId: string, smoothType: SmoothType) => void;
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
      const { nodes } = get();

      // Try to find the root node from either source or target
      const sourceRootNode = getRootNodeOfSubtree(connection.source!, nodes);
      const targetRootNode = getRootNodeOfSubtree(connection.target!, nodes);
      const rootNode = sourceRootNode || targetRootNode;
      const smoothType = rootNode?.data?.smoothType || SMOOTH_TYPES.SMOOTHSTEP;

      const edge = {
        ...connection,
        type: MINDMAP_TYPES.EDGE,
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
          smoothType,
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
        type: MINDMAP_TYPES.ROOT_NODE,
        position: {
          x: Math.random() * 500 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          level: 0,
          content: `<p>New Node ${nodes.length + 1}</p>`,
          side: SIDE.MID,
          isCollapsed: false,
          smoothType: SMOOTH_TYPES.SMOOTHSTEP,
        },
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
      side: Side | 'mid',
      nodeType: MindMapTypes = MINDMAP_TYPES.TEXT_NODE
    ) => {
      const pushUndo = useClipboardStore.getState().pushToUndoStack;
      pushUndo(get().nodes, get().edges);

      const { nodes } = get();

      // Find the root node to get the smoothType
      const rootNode = getRootNodeOfSubtree(parentNode.id!, nodes);
      const smoothType = rootNode?.data?.smoothType || SMOOTH_TYPES.SMOOTHSTEP;

      const id = generateId();
      const newNode: MindMapNode = {
        id,
        type: nodeType,
        data: {
          level: parentNode.data?.level ? parentNode.data.level + 1 : 1,
          content: `<p>${id}</p>`,
          parentId: parentNode.id,
          side: side,
          isCollapsed: false,
          ...(nodeType === MINDMAP_TYPES.SHAPE_NODE && {
            shape: 'rectangle' as const,
            width: 120,
            height: 60,
          }),
          ...(nodeType === MINDMAP_TYPES.IMAGE_NODE && {
            width: 250,
            height: 180,
            alt: 'Image',
          }),
        },
        dragHandle: DragHandle.SELECTOR,
        position,
      };

      const newEdge = {
        id: generateId(),
        source: parentNode.id!,
        target: newNode.id,
        type: MINDMAP_TYPES.EDGE,
        sourceHandle: side === SIDE.LEFT ? `first-source-${parentNode.id}` : `second-source-${parentNode.id}`,
        targetHandle: side === SIDE.LEFT ? `second-target-${newNode.id}` : `first-target-${newNode.id}`,
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
          smoothType,
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

    hasLeftChildren: (nodeId: string) => {
      const { nodes } = get();
      return nodes.some((node) => node.data.parentId === nodeId && node.data.side === SIDE.LEFT);
    },

    hasRightChildren: (nodeId: string) => {
      const { nodes } = get();
      return nodes.some((node) => node.data.parentId === nodeId && node.data.side === SIDE.RIGHT);
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

    toggleCollapse: (nodeId: string, side: Side, shouldCollapse: boolean) => {
      const { nodes, edges } = get();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const pushUndo = useClipboardStore.getState().pushToUndoStack;
      pushUndo(nodes, edges);

      const descendantNodes = getAllDescendantNodes(nodeId, nodes);

      const updatedNodes = nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              isLeftChildrenCollapsed: side === SIDE.LEFT ? shouldCollapse : n.data.isLeftChildrenCollapsed,
              isRightChildrenCollapsed:
                side === SIDE.RIGHT ? shouldCollapse : n.data.isRightChildrenCollapsed,
            },
          };
        }

        if (descendantNodes.some((descendant) => descendant.id === n.id && descendant.data.side === side)) {
          return {
            ...n,
            data: { ...n.data, isCollapsed: shouldCollapse },
          };
        }
        return n;
      });

      const updatedEdges = edges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (
          descendantNodes.some(
            (descendant) =>
              (descendant.id === edge.source && descendant.data.side === side) ||
              (descendant.id === edge.target && descendant.data.side === side)
          ) ||
          (sourceNode &&
            targetNode &&
            ((sourceNode.data.side === side && descendantNodes.some((d) => d.id === sourceNode.id)) ||
              (targetNode.data.side === side && descendantNodes.some((d) => d.id === targetNode.id))))
        ) {
          return {
            ...edge,
            data: { ...edge.data, isCollapsed: shouldCollapse },
          };
        }
        return edge;
      });

      set(
        () => ({
          nodes: updatedNodes,
          edges: updatedEdges,
        }),
        false,
        shouldCollapse ? 'mindmap/collapse' : 'mindmap/expand'
      );
    },

    expand: (nodeId: string, side: Side) => {
      get().toggleCollapse(nodeId, side, false);
    },

    collapse: (nodeId: string, side: Side) => {
      get().toggleCollapse(nodeId, side, true);
    },

    moveToChild: (sourceId: string, targetId: string, side?: Side) => {
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
      const newSide = isTargetRoot ? (side ?? SIDE.LEFT) : targetNode.data?.side;
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
        const position = side === SIDE.LEFT ? (isSource ? 'first' : 'second') : isSource ? 'second' : 'first';
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
        // Find the root node to get the smoothType
        const rootNode = getRootNodeOfSubtree(targetId, nodes);
        const smoothType = rootNode?.data?.smoothType || SMOOTH_TYPES.SMOOTHSTEP;

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
            smoothType,
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

    updateSubtreeEdgeSmoothType: (rootNodeId: string, smoothType: SmoothType) => {
      const { nodes, edges } = get();

      const descendantNodes = getAllDescendantNodes(rootNodeId, nodes);
      const allNodeIds = new Set([rootNodeId, ...descendantNodes.map((n) => n.id)]);

      const pushUndo = useClipboardStore.getState().pushToUndoStack;
      pushUndo(nodes, edges);

      // Update the root node's smoothType data
      const updatedNodes = nodes.map((node) => {
        if (node.id === rootNodeId && node.type === MINDMAP_TYPES.ROOT_NODE) {
          return {
            ...node,
            data: {
              ...node.data,
              smoothType,
            },
          };
        }
        return node;
      });

      const updatedEdges = edges.map((edge) => {
        const isSubtreeEdge = allNodeIds.has(edge.source) || allNodeIds.has(edge.target);

        if (isSubtreeEdge) {
          return {
            ...edge,
            data: {
              ...edge.data,
              smoothType,
            },
          };
        }

        return edge;
      });

      set(
        () => ({
          nodes: updatedNodes,
          edges: updatedEdges,
        }),
        false,
        'mindmap/updateSubtreeEdgeSmoothType'
      );
    },
  }))
);
