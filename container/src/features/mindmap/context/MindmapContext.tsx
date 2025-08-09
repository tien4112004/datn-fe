import React, { createContext, useContext, useCallback, useState, useRef, useMemo } from 'react';
import {
  useEdgesState,
  useNodesState,
  addEdge,
  type Connection,
  type XYPosition,
  useReactFlow,
} from '@xyflow/react';
import type { MindMapNode, MindMapEdge, MindmapContextType } from '../types';
import { DragHandle, MINDMAP_TYPES } from '../constants';
import { generateId } from '@/shared/lib/utils';

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
  //     data: { label: 'Branch 1', level: 1 },
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
  //     target: '2',
  //     type: 'smoothstep',
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
  const [cloningNodes, setCloningNodes] = useState<MindMapNode[]>([]);
  const [cloningEdges, setCloningEdges] = useState<MindMapEdge[]>([]);
  const [nodeId, setNodeId] = useState(1);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const { screenToFlowPosition } = useReactFlow();

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
          ? `right-target-${newNode.id}`
          : `left-target-${newNode.id}`,
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

  const copySelectedNodesAndEdges = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedEdges = edges.filter((edge) => edge.selected);

    if (selectedNodes.length === 0) return;

    setCloningNodes(selectedNodes);
    setCloningEdges(selectedEdges);
  }, [nodes, edges]);

  const pasteClonedNodesAndEdges = useCallback(() => {
    if (cloningNodes.length === 0) return;
    const rootPosition = cloningNodes[0].position || { x: 0, y: 0 };

    // Generate fresh nodes with new IDs to avoid duplicates
    const freshNodes = cloningNodes.map((node) => ({
      ...node,
      id: generateId(),
      data: {
        ...node.data,
        content: `<p>Cloned: ${node.data.content}</p>`,
        metadata: {
          oldId: node.id,
        },
      },
      selected: false,
    }));

    const freshEdges = cloningEdges.map((edge) => {
      const newSource = freshNodes.find((node) => node.data.metadata?.oldId === edge.source);
      const newTarget = freshNodes.find((node) => node.data.metadata?.oldId === edge.target);

      return {
        ...edge,
        id: generateId(),
        source: newSource ? newSource.id : edge.source,
        target: newTarget ? newTarget.id : edge.target,
        sourceHandle: edge.sourceHandle?.replace(edge.source, newSource?.id || edge.source),
        targetHandle: edge.targetHandle?.replace(edge.target, newTarget?.id || edge.target),
      };
    });

    setNodes((nds: MindMapNode[]) => [
      ...nds.map((node) => ({ ...node, selected: false })),
      ...freshNodes.map((node) => {
        const { x, y } = screenToFlowPosition({
          x: mousePositionRef.current.x,
          y: mousePositionRef.current.y,
        });
        return {
          ...node,
          position: {
            x: x - rootPosition.x + node.position.x,
            y: y - rootPosition.y + node.position.y,
          },
          selected: true,
        };
      }),
    ]);
    setEdges((eds: MindMapEdge[]) => [...eds, ...freshEdges]);
  }, [cloningNodes, cloningEdges, setNodes, setEdges, screenToFlowPosition]);

  const onMouseMove = useCallback((event: any) => {
    const { clientX, clientY } = event;
    mousePositionRef.current = { x: clientX, y: clientY };
  }, []);

  const value = useMemo(
    () => ({
      nodes,
      edges,
      setNodes,
      setEdges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onMouseMove,
      addNode,
      deleteSelectedNodes,
      addChildNode,
      markNodeForDeletion,
      finalizeNodeDeletion,
      selectAllNodesAndEdges,
      copySelectedNodesAndEdges,
      pasteClonedNodesAndEdges,
    }),
    [
      nodes,
      edges,
      setNodes,
      setEdges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onMouseMove,
      addNode,
      deleteSelectedNodes,
      addChildNode,
      markNodeForDeletion,
      finalizeNodeDeletion,
      selectAllNodesAndEdges,
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
