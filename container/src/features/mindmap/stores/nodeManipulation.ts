import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'sonner';
import type { MindMapEdge, PathType, Side } from '../types';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../types';
import { generateId } from '@/shared/lib/utils';
import { getAllDescendantNodes, getRootNodeOfSubtree } from '../services/utils';
import { useCoreStore } from './core';
import { useClipboardStore } from './clipboard';

interface NodeManipulationState {
  toggleCollapse: (nodeId: string, side: Side, shouldCollapse: boolean) => void;
  collapse: (nodeId: string, side: Side) => void;
  expand: (nodeId: string, side: Side) => void;
  moveToChild: (sourceId: string, targetId: string, side?: Side) => void;
  updateSubtreeEdgePathType: (rootNodeId: string, pathType: PathType) => void;
  updateSubtreeEdgeColor: (rootNodeId: string, edgeColor: string) => void;
}

export const useNodeManipulationStore = create<NodeManipulationState>()(
  devtools(
    (_, get) => ({
      toggleCollapse: (nodeId: string, side: Side, shouldCollapse: boolean) => {
        const { nodes, edges, setNodes, setEdges } = useCoreStore.getState();
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const pushUndo = useClipboardStore.getState().pushToUndoStack;
        pushUndo(nodes, edges);

        const descendantNodes = getAllDescendantNodes(nodeId, nodes);
        const affectedDescendants = descendantNodes.filter((d) => d.data.side === side);

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

          const isAffectedDescendant = affectedDescendants.some((d) => d.id === n.id);
          if (!isAffectedDescendant) {
            return n;
          }

          if (shouldCollapse) {
            // Collapsing
            return {
              ...n,
              data: {
                ...n.data,
                isCollapsed: true,
                collapsedBy: n.data.collapsedBy || nodeId,
              },
            };
          } else {
            // Expanding: only show nodes that were hidden by this specific ancestor
            if (n.data.collapsedBy === nodeId) {
              return {
                ...n,
                data: {
                  ...n.data,
                  isCollapsed: false,
                  collapsedBy: undefined,
                },
              };
            }
          }

          return n;
        });

        const updatedEdges = edges.map((edge) => {
          const targetNode = updatedNodes.find((n) => n.id === edge.target);
          const isAffectedEdge = affectedDescendants.some(
            (d) => d.id === edge.source || d.id === edge.target
          );

          if (isAffectedEdge) {
            return {
              ...edge,
              data: {
                ...edge.data,
                isCollapsed: targetNode?.data.isCollapsed || false,
              },
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

        const pushUndo = useClipboardStore.getState().pushToUndoStack;
        pushUndo(nodes, edges);

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
          // Find the root node to get the pathType
          const rootNode = getRootNodeOfSubtree(targetId, nodes);
          const pathType = (rootNode?.data?.pathType || PATH_TYPES.SMOOTHSTEP) as PathType;

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
              pathType,
            },
          };
          updatedEdges.push(newEdge);
        }

        setNodes(updatedNodes);
        setEdges(updatedEdges);
      },

      updateSubtreeEdgePathType: (rootNodeId: string, pathType: PathType) => {
        const { nodes, edges, setNodes, setEdges } = useCoreStore.getState();

        const pushUndo = useClipboardStore.getState().pushToUndoStack;
        pushUndo(nodes, edges);

        const descendantNodes = getAllDescendantNodes(rootNodeId, nodes);
        const allNodeIds = new Set([rootNodeId, ...descendantNodes.map((n) => n.id)]);

        // Update the root node's pathType data
        const updatedNodes = nodes.map((node) => {
          if (node.id === rootNodeId && node.type === MINDMAP_TYPES.ROOT_NODE) {
            return {
              ...node,
              data: {
                ...node.data,
                pathType,
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
                pathType,
              },
            };
          }

          return edge;
        });

        setNodes(updatedNodes);
        setEdges(updatedEdges);
      },

      updateSubtreeEdgeColor: (rootNodeId: string, edgeColor: string) => {
        const { nodes, edges, setEdges, setNodes } = useCoreStore.getState();

        const pushUndo = useClipboardStore.getState().pushToUndoStack;
        pushUndo(nodes, edges);

        const descendantNodes = getAllDescendantNodes(rootNodeId, nodes);
        const allNodeIds = new Set([rootNodeId, ...descendantNodes.map((n) => n.id)]);

        const updatedNodes = nodes.map((node) => {
          if (node.id === rootNodeId && node.type === MINDMAP_TYPES.ROOT_NODE) {
            return {
              ...node,
              data: {
                ...node.data,
                edgeColor,
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
                strokeColor: edgeColor,
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
