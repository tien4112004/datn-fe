import React, { createContext, useContext, useCallback, useState } from 'react';
import { useEdgesState, useNodesState, addEdge, type Connection, type XYPosition } from '@xyflow/react';
import type { MindMapNode } from '../components/MindmapNode';
import type { MindMapEdge } from '../components/MindmapEdge';
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

interface MindmapContextType {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  setNodes: React.Dispatch<React.SetStateAction<MindMapNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<MindMapEdge[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: MindMapEdge | Connection) => void;
  addNode: () => void;
  deleteSelectedNodes: () => void;
  addChildNode: (parentNode: Partial<MindMapNode>, position: XYPosition, sourceHandler?: string) => void;
  markNodeForDeletion: (nodeId: string) => void;
  finalizeNodeDeletion: (nodeId: string) => void;
}

const MindmapContext = createContext<MindmapContextType | undefined>(undefined);

interface MindmapProviderProps {
  children: React.ReactNode;
}

export const MindmapProvider: React.FC<MindmapProviderProps> = ({ children }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(1);

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
      setEdges((eds: any) => addEdge(edge, eds));
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

  const value = {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteSelectedNodes,
    addChildNode,
    markNodeForDeletion,
    finalizeNodeDeletion,
  };

  return <MindmapContext.Provider value={value}>{children}</MindmapContext.Provider>;
};

export const useMindmap = (): MindmapContextType => {
  const context = useContext(MindmapContext);
  if (context === undefined) {
    throw new Error('useMindmap must be used within a MindmapProvider');
  }
  return context;
};
