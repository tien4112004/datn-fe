import React from 'react';

import '@xyflow/react/dist/style.css';
import { Plus, Trash2 } from 'lucide-react';
import MindMapNode from './MindmapNode';
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from '@xyflow/react';
import { useMindmap } from '../context/MindmapContext';

const nodeTypes = {
  mindMapNode: MindMapNode,
};

const MindMap: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, deleteSelectedNodes } =
    useMindmap();

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

        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 shadow-md transition-colors hover:opacity-90"
          onClick={() => {
            console.log(nodes);
            console.log(edges);
          }}
        >
          <span className="sr-only">Log Nodes and Edges</span>
          <Trash2 size={16} />
          Log Data
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
