import React, { createContext, useContext, useCallback, useState, useRef, useMemo, useEffect } from 'react';
import {
  useEdgesState,
  useNodesState,
  addEdge,
  type Connection,
  type XYPosition,
  useReactFlow,
  useNodesInitialized,
  useUpdateNodeInternals,
} from '@xyflow/react';
import type { MindMapNode, MindMapEdge, MindmapContextType } from '../types';
import { DIRECTION, DragHandle, MINDMAP_TYPES, type Direction } from '../constants';
import { generateId } from '@/shared/lib/utils';
import { useClipboardStore } from '../stores/useClipboardStore';
import dagre from '@dagrejs/dagre';

const initialNodes: MindMapNode[] = [
  {
    id: '1',
    type: 'mindMapNode',
    position: { x: 400, y: 300 },
    data: { level: 0, content: '<p>Central Idea</p>' },
    dragHandle: DragHandle.SELECTOR,
  },
  //   {
  //     id: '2',
  //     type: 'mindMapNode',
  //     position: { x: 200, y: 200 },
  //     data: { level: 1, content: '<p>Branch 1</p>' },
  //     parentId: '1',
  //   },
  //   {
  //     id: '3',
  //     type: 'mindMapNode',
  //     position: { x: 200, y: 400 },
  //     data: { label: 'Branch 2', level: 1 },
  //     parentId: '1',
  //   },
  //   {
  //     id: '4',
  //     type: 'mindMapNode',
  //     position: { x: 600, y: 200 },
  //     data: { label: 'Branch 3', level: 1 },
  //     parentId: '1',
  //   },
  //   {
  //     id: '5',
  //     type: 'mindMapNode',
  //     position: { x: 50, y: 150 },
  //     data: { label: 'Sub-idea 1.1', level: 2 },
  //     parentId: '2',
  //   },
  //   {
  //     id: '6',
  //     type: 'mindMapNode',
  //     position: { x: 50, y: 250 },
  //     data: { label: 'Sub-idea 1.2', level: 2 },
  //     parentId: '2',
  //   },
];

const initialEdges: MindMapEdge[] = [
  //   {
  //     id: 'e1-2',
  //     source: '1',
  //     sourceHandle: 'second-source-1',
  //     target: '2',
  //     targetHandle: 'first-target-2',
  //     type: 'mindmapEdge',
  //   },
  //   {
  //     id: 'e1-3',
  //     source: '1',
  //     target: '3',
  //     type: 'smoothstep',
  //   },
  //   {
  //     id: 'e1-4',
  //     source: '1',
  //     target: '4',
  //     type: 'smoothstep',
  //   },
  //   {
  //     id: 'e2-5',
  //     source: '2',
  //     target: '5',
  //     type: 'smoothstep',
  //   },
  //   {
  //     id: 'e2-6',
  //     source: '2',
  //     target: '6',
  //     type: 'smoothstep',
  //   },
];

const MindmapContext = createContext<MindmapContextType | undefined>(undefined);

interface MindmapProviderProps {
  children: React.ReactNode;
}

export const MindmapProvider: React.FC<MindmapProviderProps> = ({ children }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(1);
  const [isLayouting, setIsLayouting] = useState(false);
  const { screenToFlowPosition, getIntersectingNodes, fitView } = useReactFlow();
  const layout = useRef<Direction>('horizontal');
  const nodesInitialized = useNodesInitialized();
  const updateNodeInternals = useUpdateNodeInternals();

  // Clip board
  const clipboardCopySelectedNodesAndEdges = useClipboardStore((state) => state.copySelectedNodesAndEdges);
  const clipboardPasteClonedNodesAndEdges = useClipboardStore((state) => state.pasteClonedNodesAndEdges);

  const copySelectedNodesAndEdges = useCallback(() => {
    clipboardCopySelectedNodesAndEdges(nodes, edges);
  }, [nodes, edges, clipboardCopySelectedNodesAndEdges]);

  const pasteClonedNodesAndEdges = useCallback(() => {
    clipboardPasteClonedNodesAndEdges(screenToFlowPosition, setNodes, setEdges);
  }, [clipboardPasteClonedNodesAndEdges, screenToFlowPosition, setNodes, setEdges]);
  console.log('MindmapProvider rendered');

  const onConnect = useCallback(
    (params: MindMapEdge | Connection) => {
      const edge = {
        ...params,
        type: MINDMAP_TYPES.MINDMAP_EDGE,
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
        },
      };
      setEdges((eds: MindMapEdge[]) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const addChildNode = useCallback(
    (parentNode: Partial<MindMapNode>, position: XYPosition, sourceHandler?: string) => {
      const newNode: MindMapNode = {
        id: generateId(),
        type: MINDMAP_TYPES.MINDMAP_NODE,
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
        source: parentNode.id,
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

      setNodes((nds: MindMapNode[]) => [...nds, newNode]);
      setEdges((eds: MindMapEdge[]) => [...eds, newEdge]);
    },
    [setNodes, setEdges]
  );

  const addNode = useCallback(() => {
    const newNode: MindMapNode = {
      id: generateId(),
      type: MINDMAP_TYPES.MINDMAP_NODE,
      position: {
        x: Math.random() * 500 + 100,
        y: Math.random() * 400 + 100,
      },
      data: { level: 1, content: `<p>New Node ${nodes.length + 1}</p>` },
    };

    setNodes((nds: MindMapNode[]) => [...nds, newNode]);
    setNodeId((id) => id + 1);
  }, [nodeId, setNodes]);

  const markNodeForDeletion = useCallback(
    (nodeId: string) => {
      setNodes((nds: MindMapNode[]) =>
        nds.map((node: MindMapNode) =>
          node.id === nodeId ? { ...node, data: { ...node.data, isDeleting: true } } : node
        )
      );
    },
    [setNodes]
  );

  const finalizeNodeDeletion = useCallback(
    (nodeId: string) => {
      setNodes((nds: MindMapNode[]) => nds.filter((node: MindMapNode) => node.id !== nodeId));
      setEdges((eds: MindMapEdge[]) =>
        eds.filter((edge: MindMapEdge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  const deleteSelectedNodes = useCallback(() => {
    const selectedNodeIds = nodes.filter((node) => node.selected).map((node) => node.id);
    selectedNodeIds.forEach((nodeId) => markNodeForDeletion(nodeId));
  }, [nodes, markNodeForDeletion]);

  const selectAllNodesAndEdges = useCallback(() => {
    setNodes((nds: MindMapNode[]) => nds.map((node: MindMapNode) => ({ ...node, selected: true })));
    setEdges((eds: MindMapEdge[]) => eds.map((edge: MindMapEdge) => ({ ...edge, selected: true })));
  }, [setNodes, setEdges]);

  const deselectAllNodesAndEdges = useCallback(() => {
    setNodes((nds: MindMapNode[]) => nds.map((node: MindMapNode) => ({ ...node, selected: false })));
    setEdges((eds: MindMapEdge[]) => eds.map((edge: MindMapEdge) => ({ ...edge, selected: false })));
  }, [setNodes, setEdges]);

  const getLayoutedElements = useCallback(
    (nodes: MindMapNode[], edges: MindMapEdge[], direction: Direction) => {
      if (nodes.length === 0 || direction === DIRECTION.NONE) return { nodes, edges };

      try {
        // Create a new directed graph
        const g = new dagre.graphlib.Graph();

        // Set an object for the graph label
        g.setDefaultEdgeLabel(() => ({}));

        // Configure the graph based on direction
        if (direction === DIRECTION.VERTICAL) {
          g.setGraph({ rankdir: 'TB', ranksep: 120 });
        } else if (direction === DIRECTION.HORIZONTAL) {
          g.setGraph({ rankdir: 'LR', ranksep: 120 });
        } else {
          return { nodes, edges };
        }

        // Add nodes to the graph
        nodes.forEach((node: MindMapNode) => {
          g.setNode(node.id, {
            width: node.measured?.width || 220,
            height: node.measured?.height || 40,
          });
        });

        // Add edges to the graph
        edges.forEach((edge: MindMapEdge) => {
          g.setEdge(edge.source, edge.target);
        });

        // Calculate the layout
        dagre.layout(g, {
          disableOptimalOrderHeuristic: true,
        });

        // Update node positions based on dagre layout
        const layoutedNodes = nodes.map((node: any) => {
          const nodeWithPosition = g.node(node.id);
          return {
            ...node,
            position: {
              // Dagre gives us the center position, adjust to top-left
              x: nodeWithPosition.x - (nodeWithPosition.width || 150) / 2,
              y: nodeWithPosition.y - (nodeWithPosition.height || 40) / 2,
            },
          };
        });

        return {
          nodes: layoutedNodes,
          edges,
        };
      } catch (error) {
        console.warn('Layout calculation failed:', error);
        return { nodes, edges };
      }
    },
    []
  );

  const updateLayout = useCallback(
    (direction: Direction) => {
      if (!nodes?.length || !edges) return;

      setIsLayouting(true);

      // Calculate new positions
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);

      // Update nodes with smooth transitions using React Flow's animation system
      setNodes([
        ...layoutedNodes.map((layoutedNode) => {
          return {
            ...layoutedNode,
            // Apply smooth transition using React Flow's built-in animation
            style: {
              ...layoutedNode.style,
              transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            },
          };
        }),
      ]);
      setEdges([...layoutedEdges]);

      // Remove isLayouting flag after animation completes
      setTimeout(() => {
        setIsLayouting(false);
        setNodes((nds: MindMapNode[]) =>
          nds.map((node) => ({ ...node, style: { ...node.style, transition: '' } }))
        );
      }, 800);

      setTimeout(() => {
        updateNodeInternals(nodes.map((node) => node.id));
      }, 0);
    },
    [nodes, edges, setNodes, setEdges, getLayoutedElements]
  );

  const onLayoutChange = useCallback(
    (direction: Direction) => {
      layout.current = direction;
      updateLayout(direction);
    },
    [updateLayout, fitView, updateNodeInternals]
  );

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (nodes.length > 0 && nodesInitialized && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Add a small delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        updateLayout(layout.current);
      }, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [nodes.length, nodesInitialized, updateLayout]);

  const onNodeDrag = useCallback(
    (_: MouseEvent, node: MindMapNode) => {
      const intersections = getIntersectingNodes(node).map((n) => n.id);

      if (intersections.length > 0) {
        const intersectingNode = nodes.find((n) => n.id === intersections[0]);
        if (intersectingNode) {
          // TODO: Implement logic to make dragging node a child of the intersecting node after auto layout
        }
      }
    },
    [getIntersectingNodes]
  );

  const value = useMemo(
    () => ({
      nodes,
      edges,
      layout: layout.current,
      isLayouting,
      setNodes,
      setEdges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onNodeDrag,
      updateLayout,
      onLayoutChange,
      addNode,
      deleteSelectedNodes,
      addChildNode,
      markNodeForDeletion,
      finalizeNodeDeletion,
      selectAllNodesAndEdges,
      deselectAllNodesAndEdges,
      copySelectedNodesAndEdges,
      pasteClonedNodesAndEdges,
    }),
    [
      nodes,
      edges,
      layout,
      isLayouting,
      setNodes,
      setEdges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onNodeDrag,
      updateLayout,
      onLayoutChange,
      addNode,
      deleteSelectedNodes,
      addChildNode,
      markNodeForDeletion,
      finalizeNodeDeletion,
      selectAllNodesAndEdges,
      deselectAllNodesAndEdges,
      copySelectedNodesAndEdges,
      pasteClonedNodesAndEdges,
    ]
  );

  return <MindmapContext.Provider value={value}>{children}</MindmapContext.Provider>;
};

export const useMindmap = (): MindmapContextType => {
  const context = useContext(MindmapContext);
  if (context === undefined) {
    throw new Error('useMindmap must be used within a MindmapProvider');
  }
  return context;
};
