import React, { useCallback, useState, useMemo } from 'react';

import '@xyflow/react/dist/style.css';
import { Plus, Trash2 } from 'lucide-react';
import MindMapNode from './MindmapNode';
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type XYPosition,
} from '@xyflow/react';

const nodeTypes = {
  mindMapNode: MindMapNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'mindMapNode',
    position: { x: 400, y: 300 },
    data: { label: 'Central Idea', level: 0 },
  },
  {
    id: '2',
    type: 'mindMapNode',
    position: { x: 200, y: 200 },
    data: { label: 'Branch 1', level: 1 },
  },
  {
    id: '3',
    type: 'mindMapNode',
    position: { x: 200, y: 400 },
    data: { label: 'Branch 2', level: 1 },
  },
  {
    id: '4',
    type: 'mindMapNode',
    position: { x: 600, y: 200 },
    data: { label: 'Branch 3', level: 1 },
  },
  {
    id: '5',
    type: 'mindMapNode',
    position: { x: 50, y: 150 },
    data: { label: 'Sub-idea 1.1', level: 2 },
  },
  {
    id: '6',
    type: 'mindMapNode',
    position: { x: 50, y: 250 },
    data: { label: 'Sub-idea 1.2', level: 2 },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    type: 'smoothstep',
  },
  {
    id: 'e1-4',
    source: '1',
    target: '4',
    type: 'smoothstep',
  },
  {
    id: 'e2-5',
    source: '2',
    target: '5',
    type: 'smoothstep',
  },
  {
    id: 'e2-6',
    source: '2',
    target: '6',
    type: 'smoothstep',
  },
];

const MindMap: React.FC = () => {
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

  const addChildNode = (parentNode: Node, position: XYPosition) => {
    const newNode = {
      id: nanoid(),
      type: 'mindmap',
      data: { label: 'New Node' },
      position,
      parentNode: parentNode.id,
    };

    const newEdge = {
      id: nanoid(),
      source: parentNode.id,
      target: newNode.id,
    };

    setNodes((nds: any) => [...nds, newNode]);
    setEdges((eds: any) => [...eds, newEdge]);
  };

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: nodeId.toString(),
      type: 'mindMapNode',
      position: {
        x: Math.random() * 500 + 100,
        y: Math.random() * 400 + 100,
      },
      data: { label: `New Node ${nodeId}`, level: 1 },
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

  const proOptions = { hideAttribution: true };

  return (
    <div className="h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
      {/* Toolbar */}
      <div className="absolute left-4 top-4 z-10 flex gap-2">
        <button
          onClick={addNode}
          className="flex items-center gap-2 rounded-lg px-4 py-2 shadow-md transition-colors hover:opacity-90"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
          }}
          title="Add new node"
        >
          <Plus size={16} />
          Add Node
        </button>

        <button
          onClick={deleteSelectedNodes}
          className="flex items-center gap-2 rounded-lg px-4 py-2 shadow-md transition-colors hover:opacity-90"
          style={{
            backgroundColor: 'var(--destructive)',
            color: 'var(--destructive-foreground)',
          }}
          title="Delete selected nodes"
        >
          <Trash2 size={16} />
          Delete Selected
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute right-4 top-4 z-10 max-w-xs">
        <div
          className="rounded-lg p-4 text-sm shadow-md"
          style={{
            backgroundColor: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
          }}
        >
          <h3 className="mb-2 font-semibold">How to use:</h3>
          <ul className="space-y-1 text-xs">
            <li>• Drag nodes to reposition</li>
            <li>• Click a node and drag from handles to connect</li>
            <li>• Double-click node text to edit</li>
            <li>• Select nodes and click Delete to remove</li>
            <li>• Use mouse wheel to zoom</li>
          </ul>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls className="!border-border !bg-white/90" style={{ border: '1px solid var(--border)' }} />

        <MiniMap
          className="!border-border !bg-white/90"
          style={{
            border: '1px solid var(--border)',
            backgroundColor: 'var(--muted)',
          }}
          nodeStrokeColor="var(--primary)"
          nodeColor="var(--primary)"
          nodeBorderRadius={8}
        />

        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          style={{ backgroundColor: 'var(--background)' }}
          color="var(--muted-foreground)"
        />
      </ReactFlow>
    </div>
  );
};

export default MindMap;
function nanoid() {
  throw new Error('Function not implemented.');
}
