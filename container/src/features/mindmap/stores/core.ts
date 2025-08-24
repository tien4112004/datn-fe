import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Connection } from '@xyflow/react';
import { devtools, persist } from 'zustand/middleware';
import type { MindMapNode, MindMapEdge } from '../types';
import { MINDMAP_TYPES, PATH_TYPES } from '../types';
import { SIDE } from '../types/constants';
import { getRootNodeOfSubtree } from '../services/utils';

interface CoreState {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  selectedNodeIds: Set<string>;
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
  logData: () => void;
  syncState: (updateNodeInternals: any) => void;
  selectAllNodesAndEdges: () => void;
  deselectAllNodesAndEdges: () => void;
  updateSelectedNodeIds: () => void;
}

export const useCoreStore = create<CoreState>()(
  devtools(
    persist(
      (set, get) => ({
        nodes: [],
        edges: [],
        selectedNodeIds: new Set<string>(),

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
          const pathType = rootNode?.data?.pathType || PATH_TYPES.SMOOTHSTEP;

          const edge = {
            ...connection,
            type: MINDMAP_TYPES.EDGE,
            data: {
              strokeColor: 'var(--primary)',
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
              return {
                nodes: newNodes,
                selectedNodeIds: newSelectedNodeIds,
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

        logData: () => {
          const { nodes, edges } = get();
          console.log('Nodes:', nodes);
          console.log('Edges:', edges);
        },

        syncState: (updateNodeInternals: any) => {
          const { nodes } = get();
          updateNodeInternals(nodes.map((node) => node.id));
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
            return {
              selectedNodeIds: newSelectedNodeIds,
            };
          });
        },
      }),
      {
        name: 'CoreStore',
      }
    ),
    { name: 'CoreStore' }
  )
);
