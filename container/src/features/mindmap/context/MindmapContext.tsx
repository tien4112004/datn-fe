import React, { createContext, useContext, useCallback, useState } from 'react';
import {
  useEdgesState,
  useNodesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type XYPosition,
} from '@xyflow/react';
import type { MindMapNodeData } from '../components/MindmapNode';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'mindMapNode',
    position: { x: 400, y: 300 },
    data: { label: 'Central Idea', level: 0, htmlContent: '<p>Central Idea</p>' },
    dragHandle: '.dragHandle',
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

const initialEdges: Edge[] = [
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
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: Edge | Connection) => void;
  addNode: () => void;
  deleteSelectedNodes: () => void;
  addChildNode: (parentNode: Partial<MindMapNodeData>, position: XYPosition, sourceHandler?: string) => void;
}

const MindmapContext = createContext<MindmapContextType | undefined>(undefined);

interface MindmapProviderProps {
  children: React.ReactNode;
}

export const MindmapProvider: React.FC<MindmapProviderProps> = ({ children }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(7);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        style: { stroke: 'var(--primary)', strokeWidth: 2 },
      };
      setEdges((eds: any) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const addChildNode = useCallback(
    (parentNode: Partial<MindMapNodeData>, position: XYPosition, sourceHandler?: string) => {
      const generateId = () => Math.random().toString(36).substr(2, 9);

      const newNode = {
        id: generateId(),
        type: 'mindMapNode',
        data: {
          label: 'New Node',
          level: parentNode.data?.level ? parentNode.data.level + 1 : 1,
          htmlContent: '<p>New Node</p>',
          isNew: true,
        },
        dragHandle: '.dragHandle',
        position,
      };

      const newEdge = {
        id: generateId(),
        source: parentNode.id,
        target: newNode.id,
        type: 'smoothstep',
        sourceHandle: sourceHandler,
        targetHandle: sourceHandler?.startsWith('left')
          ? `right-target-${newNode.id}`
          : `left-target-${newNode.id}`,
      };

      setNodes((nds: any) => [...nds, newNode]);
      setEdges((eds: any) => [...eds, newEdge]);
    },
    [setNodes, setEdges]
  );

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: nodeId.toString(),
      type: 'mindMapNode',
      position: {
        x: Math.random() * 500 + 100,
        y: Math.random() * 400 + 100,
      },
      data: { label: `New Node ${nodeId}`, level: 1, htmlContent: `<p>New Node ${nodeId}</p>` },
    };

    setNodes((nds: any) => [...nds, newNode]);
    setNodeId((id) => id + 1);
  }, [nodeId, setNodes]);

  const deleteSelectedNodes = useCallback(() => {
    setNodes((nds: any) => nds.filter((node: any) => !node.selected));
    setEdges((eds: any) =>
      eds.filter((edge: any) => {
        const sourceExists = nodes.some((node) => node.id === edge.source && !node.selected);
        const targetExists = nodes.some((node) => node.id === edge.target && !node.selected);
        return sourceExists && targetExists;
      })
    );
  }, [setNodes, setEdges, nodes]);

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
