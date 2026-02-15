import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'sonner';
import type { MindMapEdge, PathType, Side } from '../types';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../types';
import { generateId } from '@/shared/lib/utils';
import { getAllDescendantNodes, getRootNodeOfSubtree, getOppositeSide } from '../services/utils';
import { useCoreStore } from './core';
import { useUndoRedoStore } from './undoredo';
import i18next from 'i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

export interface NodeManipulationState {
  collapse: (nodeId: string, side: Side) => void;
  expand: (nodeId: string, side: Side) => void;
  moveToChild: (sourceId: string, targetId: string, side?: Side) => void;
  updateSubtreeEdgePathType: (rootNodeId: string, pathType: PathType) => void;
  updateSubtreeEdgeColor: (rootNodeId: string, edgeColor: string) => void;
}

export const useNodeManipulationStore = create<NodeManipulationState>()(
  devtools(
    () => ({
      expand: (nodeId: string, side: Side) => {
        const { nodes, edges, setNodes, setEdges } = useCoreStore.getState();
        const parentNode = nodes.find((n) => n.id === nodeId);
        if (!parentNode || !parentNode.data.collapsedChildren) return;

        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();

        const collapsedData = parentNode.data.collapsedChildren;
        const storedNodes =
          side === SIDE.LEFT ? collapsedData.leftNodes || [] : collapsedData.rightNodes || [];
        const storedEdges =
          side === SIDE.LEFT ? collapsedData.leftEdges || [] : collapsedData.rightEdges || [];

        if (storedNodes.length === 0 && storedEdges.length === 0) return;

        // Restore nodes with isCollapsed reset to false
        const restoredNodes = [...nodes];
        storedNodes.forEach((node) => {
          // Create a clean copy of the node with isCollapsed reset
          // We must also reset collapsedBy to ensure it's not hidden by mistake
          const restoredNode = {
            ...node,
            data: {
              ...node.data,
              isCollapsed: false,
              collapsedBy: undefined,
            },
          };
          restoredNodes.push(restoredNode);
        });

        const restoredEdges = [...edges, ...storedEdges];

        // Update parent node to clear ONLY the expanded side's stored children
        // while PRESERVING the other side's data
        const updatedNodes = restoredNodes.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                collapsedChildren: {
                  ...n.data.collapsedChildren, // Preserve existing data (e.g. other side)
                  // Overwrite only the side we are expanding
                  ...(side === SIDE.LEFT
                    ? { leftNodes: [], leftEdges: [] }
                    : { rightNodes: [], rightEdges: [] }),
                },
              },
            };
          }
          return n;
        });

        setNodes(updatedNodes);
        setEdges(restoredEdges);

        pushToUndoStack();
      },

      collapse: (nodeId: string, side: Side) => {
        const { nodes, edges, setNodes, setEdges } = useCoreStore.getState();
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();
        const descendantNodes = getAllDescendantNodes(nodeId, nodes);
        const affectedDescendants = descendantNodes.filter((d) => d.data.side === side);

        const updatedNodes = nodes
          .map((n) => {
            if (n.id === nodeId) {
              // Preserve existing collapsed data (e.g. from other side)
              const existingCollapsedData = n.data.collapsedChildren || {
                leftNodes: [],
                leftEdges: [],
                rightNodes: [],
                rightEdges: [],
              };

              return {
                ...n,
                data: {
                  ...n.data,
                  collapsedChildren: {
                    ...existingCollapsedData, // Keep other side's data
                    // Update only the current side
                    ...(side === SIDE.LEFT
                      ? {
                          leftNodes: affectedDescendants,
                          leftEdges: edges.filter((edge) =>
                            affectedDescendants.some((d) => d.id === edge.target || d.id === edge.source)
                          ),
                        }
                      : {
                          rightNodes: affectedDescendants,
                          rightEdges: edges.filter((edge) =>
                            affectedDescendants.some((d) => d.id === edge.target || d.id === edge.source)
                          ),
                        }),
                  },
                },
              };
            }

            // SAFETY CHECK: Never collapse the node that initiated the collapse
            if (n.id === nodeId) return n;

            // Don't collapse nodes that are already collapsed by another ancestor
            const isAffectedDescendant = affectedDescendants.some((d) => d.id === n.id);
            if (!isAffectedDescendant) {
              return n;
            }

            return {
              ...n,
              data: {
                ...n.data,
                isCollapsed: true,
                collapsedBy: n.data.collapsedBy || nodeId,
              },
            };
          })
          .filter((n) => {
            return !n.data.isCollapsed;
          });

        const affectedNodeIds = new Set(affectedDescendants.map((n) => n.id));
        const updatedEdges = edges.filter((edge) => {
          return !affectedNodeIds.has(edge.source) && !affectedNodeIds.has(edge.target);
        });

        setNodes(updatedNodes);
        setEdges(updatedEdges);

        pushToUndoStack();
      },

      moveToChild: (sourceId: string, targetId: string, side?: Side) => {
        if (sourceId === targetId) return;

        const { nodes, edges, setNodes, setEdges } = useCoreStore.getState();

        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();

        const sourceNode = nodes.find((node) => node.id === sourceId);
        const targetNode = nodes.find((node) => node.id === targetId);

        if (!sourceNode || !targetNode) return;

        const descendantNodes = getAllDescendantNodes(sourceId, nodes);

        if (descendantNodes.some((node) => node.id === targetId)) {
          toast.error(i18next.t('errors.cannotMoveToDescendant', { ns: I18N_NAMESPACES.MINDMAP }));
          return;
        }

        const isSourceRoot = sourceNode.data?.level === 0;
        const isTargetRoot = targetNode.data?.level === 0;
        const newSourceLevel = (targetNode.data?.level ?? 0) + 1;
        const oldSourceLevel = sourceNode.data?.level ?? 0;
        const newSide = isTargetRoot ? (side ?? SIDE.LEFT) : targetNode.data?.side;
        const oldSide = sourceNode.data?.side;
        const levelDifference = newSourceLevel - oldSourceLevel;

        const updatedNodes = nodes.map((node) => {
          if (node.id === sourceId) {
            // If source is a root node, convert it to a text node
            const newType = isSourceRoot ? MINDMAP_TYPES.TEXT_NODE : node.type;

            return {
              ...node,
              type: newType,
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

        const getHandles = (side: Side, nodeId: string, isSource: boolean) => {
          const handleType = isSource ? 'source' : 'target';
          // For target handles, use the opposite side since edge enters from opposite direction
          const handleSide = isSource ? side : getOppositeSide(side);
          return `${handleSide}-${handleType}-${nodeId}`;
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

          const isDescendantEdge = descendantNodes.some((descendant) => descendant.id === edge.target);
          if (isDescendantEdge && (isSourceRoot || newSide !== oldSide)) {
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
              strokeColor: '#0044FF',
              strokeWidth: 2,
              pathType,
            },
          };
          updatedEdges.push(newEdge);
        }

        setNodes(updatedNodes);
        setEdges(updatedEdges);

        pushToUndoStack();
      },

      updateSubtreeEdgePathType: (rootNodeId: string, pathType: PathType) => {
        const { nodes, edges, setNodes, setEdges } = useCoreStore.getState();
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();

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

        pushToUndoStack();
      },

      updateSubtreeEdgeColor: (rootNodeId: string, edgeColor: string) => {
        const { nodes, edges, setEdges, setNodes } = useCoreStore.getState();
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();

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

        pushToUndoStack();
      },
    }),
    { name: 'NodeManipulationStore' }
  )
);
