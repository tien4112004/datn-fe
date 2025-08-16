import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'sonner';
import type { MindMapEdge, SmoothType } from '../types';
import { MINDMAP_TYPES, SMOOTH_TYPES } from '../types';
import { SIDE, type Side } from '../types/constants';
import { generateId } from '@/shared/lib/utils';
import { getAllDescendantNodes, getRootNodeOfSubtree } from '../services/utils';
import { useCoreStore } from './core';

interface NodeManipulationState {
  toggleCollapse: (nodeId: string, side: Side, shouldCollapse: boolean) => void;
  collapse: (nodeId: string, side: Side) => void;
  expand: (nodeId: string, side: Side) => void;
  moveToChild: (sourceId: string, targetId: string, side?: Side) => void;
  updateSubtreeEdgeSmoothType: (rootNodeId: string, smoothType: SmoothType) => void;
}

export const useNodeManipulationStore = create<NodeManipulationState>()(
  devtools(
    (_, get) => ({
      toggleCollapse: (nodeId: string, side: Side, shouldCollapse: boolean) => {
        const { nodes, edges, setNodes, setEdges } = useCoreStore.getState();
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

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

        setNodes(updatedNodes);
        setEdges(updatedEdges);
      },

      expand: (nodeId: string, side: Side) => {
        get().toggleCollapse(nodeId, side, false);
      },

      collapse: (nodeId: string, side: Side) => {
        get().toggleCollapse(nodeId, side, true);
      },

      moveToChild: (sourceId: string, targetId: string, side?: Side) => {
        if (sourceId === targetId) return;

        const { nodes, edges, setNodes, setEdges } = useCoreStore.getState();

        const sourceNode = nodes.find((node) => node.id === sourceId);
        const targetNode = nodes.find((node) => node.id === targetId);

        if (!sourceNode || !targetNode) return;

        const descendantNodes = getAllDescendantNodes(sourceId, nodes);

        if (descendantNodes.some((node) => node.id === targetId)) {
          toast.error('Cannot move a node to one of its descendants.');
          return;
        }

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
          const position =
            side === SIDE.LEFT ? (isSource ? 'first' : 'second') : isSource ? 'second' : 'first';
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
          const smoothType = (rootNode?.data?.smoothType || SMOOTH_TYPES.SMOOTHSTEP) as SmoothType;

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

        setNodes(updatedNodes);
        setEdges(updatedEdges);
      },

      updateSubtreeEdgeSmoothType: (rootNodeId: string, smoothType: SmoothType) => {
        const { nodes, edges, setNodes, setEdges } = useCoreStore.getState();

        const descendantNodes = getAllDescendantNodes(rootNodeId, nodes);
        const allNodeIds = new Set([rootNodeId, ...descendantNodes.map((n) => n.id)]);

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

        setNodes(updatedNodes);
        setEdges(updatedEdges);
      },
    }),
    { name: 'NodeManipulationStore' }
  )
);
