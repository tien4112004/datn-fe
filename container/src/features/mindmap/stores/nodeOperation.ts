import { create } from 'zustand';
import type { XYPosition } from '@xyflow/react';
import { devtools } from 'zustand/middleware';
import type { MindMapNode, MindMapEdge, MindMapTypes, SmoothType } from '../types';
import { MINDMAP_TYPES, SMOOTH_TYPES } from '../types';
import { DragHandle, SIDE, type Side } from '../types/constants';
import { generateId } from '@/shared/lib/utils';
import { getRootNodeOfSubtree, getAllDescendantNodes } from '../services/utils';
import { useCoreStore } from './core';

interface NodeOperationsState {
  nodesToBeDeleted: Set<string>;
  addNode: () => void;
  addChildNode: (
    parentNode: Partial<MindMapNode>,
    position: XYPosition,
    side: string,
    nodeType?: MindMapTypes
  ) => void;
  updateNodeData: (nodeId: string, updates: Partial<MindMapNode['data']>) => void;
  markNodeForDeletion: (nodeId: string) => void;
  finalizeNodeDeletion: () => void;
  deleteSelectedNodes: () => void;
}

export const useNodeOperationsStore = create<NodeOperationsState>()(
  devtools(
    (set, get) => ({
      nodesToBeDeleted: new Set<string>(),

      addNode: () => {
        const { nodes, setNodes } = useCoreStore.getState();
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

        setNodes((state) => [...state, newNode]);
      },

      addChildNode: (
        parentNode: Partial<MindMapNode>,
        position: XYPosition,
        side: Side | 'mid',
        nodeType: MindMapTypes = MINDMAP_TYPES.TEXT_NODE
      ) => {
        const { nodes, setNodes, setEdges } = useCoreStore.getState();

        // Find the root node to get the smoothType
        const rootNode = getRootNodeOfSubtree(parentNode.id!, nodes);
        const smoothType = (rootNode?.data?.smoothType || SMOOTH_TYPES.SMOOTHSTEP) as SmoothType;

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
          sourceHandle:
            side === SIDE.LEFT ? `first-source-${parentNode.id}` : `second-source-${parentNode.id}`,
          targetHandle: side === SIDE.LEFT ? `second-target-${newNode.id}` : `first-target-${newNode.id}`,
          data: {
            strokeColor: 'var(--primary)',
            strokeWidth: 2,
            smoothType,
          },
        };

        setNodes((state) => [...state, newNode]);
        setEdges((state) => [...state, newEdge]);
      },

      updateNodeData: (nodeId: string, updates: Partial<MindMapNode['data']>) => {
        const { setNodes } = useCoreStore.getState();
        setNodes((state) =>
          state.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node))
        );
      },

      markNodeForDeletion: (nodeId: string) => {
        const { nodes, setNodes, setEdges } = useCoreStore.getState();
        const descendantNodes = getAllDescendantNodes(nodeId, nodes);
        const nodeIdsToDelete = new Set([nodeId, ...descendantNodes.map((n) => n.id)]);

        set({ nodesToBeDeleted: nodeIdsToDelete });

        setNodes((state) =>
          state.map((node: MindMapNode) =>
            nodeIdsToDelete.has(node.id) ? { ...node, data: { ...node.data, isDeleting: true } } : node
          )
        );

        setEdges((state) =>
          state.map((edge: MindMapEdge) =>
            nodeIdsToDelete.has(edge.source) || nodeIdsToDelete.has(edge.target)
              ? { ...edge, data: { ...edge.data, isDeleting: true } }
              : edge
          )
        );
      },

      finalizeNodeDeletion: () => {
        const { nodesToBeDeleted } = get();
        if (nodesToBeDeleted.size === 0) return;

        const { setNodes, setEdges } = useCoreStore.getState();

        setNodes((state) => state.filter((node: MindMapNode) => !nodesToBeDeleted.has(node.id)));

        setEdges((state) =>
          state.filter(
            (edge: MindMapEdge) => !nodesToBeDeleted.has(edge.source) && !nodesToBeDeleted.has(edge.target)
          )
        );

        set({ nodesToBeDeleted: new Set<string>() });
      },

      deleteSelectedNodes: () => {
        const { nodes } = useCoreStore.getState();
        const { markNodeForDeletion } = get();
        const selectedNodeIds = nodes.filter((node) => node.selected).map((node) => node.id);
        selectedNodeIds.forEach((nodeId) => markNodeForDeletion(nodeId));
      },
    }),
    { name: 'NodeOperationsStore' }
  )
);
