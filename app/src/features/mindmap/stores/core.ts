import type { Connection } from '@xyflow/react';
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { getRootNodeOfSubtree, DEFAULT_LAYOUT_TYPE } from '../services/utils';
import type { LayoutType, MindMapEdge, MindMapNode } from '../types';
import { MINDMAP_TYPES, PATH_TYPES } from '../types';
import { SIDE } from '../types/constants';

export interface CoreState {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  selectedNodeIds: Set<string>;
  // Multi-tree layout type caching
  nodeToRootMap: Map<string, string>; // nodeId → rootId
  rootLayoutTypeMap: Map<string, LayoutType>; // rootId → layoutType
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  getNode: (nodeId: string) => MindMapNode | null;
  getRoot: (nodeId: string) => MindMapNode | null;
  getNodeLength: () => number;
  setNodes: (updater: MindMapNode[] | ((nodes: MindMapNode[]) => MindMapNode[])) => void;
  setEdges: (updater: MindMapEdge[] | ((edges: MindMapEdge[]) => MindMapEdge[])) => void;
  hasLeftChildren: (nodeId: string) => boolean;
  hasRightChildren: (nodeId: string) => boolean;
  selectAllNodesAndEdges: () => void;
  deselectAllNodesAndEdges: () => void;
  updateSelectedNodeIds: () => void;
}

/**
 * Build mapping of every node to its root node ID
 * Uses recursive traversal but only runs when nodes change
 */
const buildNodeToRootMapping = (nodes: MindMapNode[]): Map<string, string> => {
  const map = new Map<string, string>();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const findRoot = (nodeId: string, visited = new Set<string>()): string | null => {
    if (visited.has(nodeId)) return null; // Prevent infinite loops
    visited.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node) return null;

    // Root nodes point to themselves
    if (node.type === MINDMAP_TYPES.ROOT_NODE) {
      return nodeId;
    }

    // Traverse up via parentId
    if (node.data.parentId) {
      return findRoot(node.data.parentId, visited);
    }

    return null;
  };

  // Build mapping for all nodes
  for (const node of nodes) {
    const rootId = findRoot(node.id);
    if (rootId) {
      map.set(node.id, rootId);
    }
  }

  return map;
};

/**
 * Extract layout type for each root node
 */
const buildRootLayoutTypeMapping = (nodes: MindMapNode[]): Map<string, LayoutType> => {
  const map = new Map<string, LayoutType>();

  for (const node of nodes) {
    if (node.type === MINDMAP_TYPES.ROOT_NODE) {
      const layoutType: LayoutType = (node.data?.layoutType as LayoutType | undefined) ?? DEFAULT_LAYOUT_TYPE;
      map.set(node.id, layoutType);
    }
  }

  return map;
};

export const useCoreStore = create<CoreState>()(
  devtools(
    persist(
      (set, get) => ({
        nodes: [],
        edges: [],
        selectedNodeIds: new Set<string>(),
        nodeToRootMap: new Map(),
        rootLayoutTypeMap: new Map(),

        onNodesChange: (changes) => {
          set(
            (state) => {
              const newNodes = applyNodeChanges(changes, state.nodes);

              // Check if any selection changes occurred
              const hasSelectionChange = changes.some(
                (change: any) =>
                  change.type === 'select' || (change.type === 'replace' && 'selected' in change.item)
              );

              // Update selectedNodeIds if selection changed
              const selectedNodeIds = hasSelectionChange
                ? new Set(newNodes.filter((node) => node.selected).map((node) => node.id))
                : state.selectedNodeIds;

              // Only rebuild mappings if structure changes (not just selection)
              const hasStructureChange = changes.some(
                (change: any) =>
                  change.type === 'add' ||
                  change.type === 'remove' ||
                  (change.type === 'replace' && ('data' in change.item || 'type' in change.item))
              );

              const nodeToRootMap = hasStructureChange
                ? buildNodeToRootMapping(newNodes)
                : state.nodeToRootMap;
              const rootLayoutTypeMap = hasStructureChange
                ? buildRootLayoutTypeMapping(newNodes)
                : state.rootLayoutTypeMap;

              return {
                nodes: newNodes,
                nodeToRootMap,
                rootLayoutTypeMap,
                selectedNodeIds,
              };
            },
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
          const pathType = rootNode?.data?.pathType || PATH_TYPES.SMOOTHSTEP;

          const edge = {
            ...connection,
            type: MINDMAP_TYPES.EDGE,
            data: {
              strokeColor: '#0044FF',
              strokeWidth: 2,
              pathType,
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
            (state) => {
              const newNodes = typeof updater === 'function' ? updater(state.nodes) : updater;
              // Update selectedNodeIds based on node.selected properties
              const newSelectedNodeIds = new Set(
                newNodes.filter((node) => node.selected).map((node) => node.id)
              );
              // Rebuild mappings when nodes change
              const nodeToRootMap = buildNodeToRootMapping(newNodes);
              const rootLayoutTypeMap = buildRootLayoutTypeMapping(newNodes);

              return {
                nodes: newNodes,
                selectedNodeIds: newSelectedNodeIds,
                nodeToRootMap,
                rootLayoutTypeMap,
              };
            },
            false,
            'mindmap/setNodes'
          );
        },

        setEdges: (updater) => {
          set(
            (state) => {
              const newEdges = typeof updater === 'function' ? updater(state.edges) : updater;
              const newSelectedEdgeIds = new Set(
                newEdges.filter((edge) => edge.selected).map((edge) => edge.id)
              );
              return {
                edges: newEdges,
                selectedEdgeIds: newSelectedEdgeIds,
              };
            },
            false,
            'mindmap/setEdges'
          );
        },

        getNode: (nodeId: string) => {
          const { nodes } = get();
          return nodes.find((node) => node.id === nodeId) || null;
        },

        getRoot: (nodeId: string) => {
          const { nodes } = get();
          return getRootNodeOfSubtree(nodeId, nodes);
        },

        getNodeLength: () => {
          return get().nodes.length;
        },

        hasLeftChildren: (nodeId: string) => {
          const { nodes } = get();
          return nodes.some((node) => node.data.parentId === nodeId && node.data.side === SIDE.LEFT);
        },

        hasRightChildren: (nodeId: string) => {
          const { nodes } = get();
          return nodes.some((node) => node.data.parentId === nodeId && node.data.side === SIDE.RIGHT);
        },

        selectAllNodesAndEdges: () => {
          set((state) => ({
            nodes: state.nodes.map((node) => ({ ...node, selected: true })),
            edges: state.edges.map((edge) => ({ ...edge, selected: true })),
            selectedNodeIds: new Set(state.nodes.map((node) => node.id)),
          }));
        },

        deselectAllNodesAndEdges: () => {
          set((state) => ({
            nodes: state.nodes.map((node) => ({ ...node, selected: false })),
            edges: state.edges.map((edge) => ({ ...edge, selected: false })),
            selectedNodeIds: new Set(),
          }));
        },

        updateSelectedNodeIds: () => {
          set((state) => {
            const newSelectedNodeIds = new Set(
              state.nodes.filter((node) => node.selected).map((node) => node.id)
            );
            if (
              newSelectedNodeIds.size !== state.selectedNodeIds.size ||
              !Array.from(newSelectedNodeIds).every((id) => state.selectedNodeIds.has(id))
            ) {
              return {
                selectedNodeIds: newSelectedNodeIds,
              };
            }
            return state;
          });
        },
      }),
      {
        name: 'CoreStore',
        storage: createJSONStorage(() => localStorage, {
          reviver: (_key, value: unknown) => {
            // Revive Set and rebuild Maps from persisted nodes
            if (
              value &&
              typeof value === 'object' &&
              'state' in value &&
              typeof value.state === 'object' &&
              value.state &&
              'selectedNodeIds' in value.state
            ) {
              const state = value.state as {
                selectedNodeIds: string[];
                nodes?: MindMapNode[];
              };

              // Rebuild maps from persisted nodes
              const nodes = state.nodes || [];
              const nodeToRootMap = buildNodeToRootMapping(nodes);
              const rootLayoutTypeMap = buildRootLayoutTypeMapping(nodes);

              return {
                ...value,
                state: {
                  ...state,
                  selectedNodeIds: new Set(state.selectedNodeIds || []),
                  nodeToRootMap,
                  rootLayoutTypeMap,
                },
              };
            }
            return value;
          },
          replacer: (_key, value: unknown) => {
            // Replace Set with array during serialization
            if (
              value &&
              typeof value === 'object' &&
              'state' in value &&
              typeof value.state === 'object' &&
              value.state &&
              'selectedNodeIds' in value.state
            ) {
              const state = value.state as { selectedNodeIds: Set<string> };
              return {
                ...value,
                state: {
                  ...state,
                  selectedNodeIds: Array.from(state.selectedNodeIds),
                },
              };
            }
            return value;
          },
        }),
      }
    ),
    { name: 'CoreStore' }
  )
);
