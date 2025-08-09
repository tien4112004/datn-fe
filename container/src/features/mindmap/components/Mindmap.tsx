import '@xyflow/react/dist/style.css';
import { Plus, Trash2 } from 'lucide-react';
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from '@xyflow/react';
import { useMindmap } from '../context/MindmapContext';
import MindMapNodeBlock from './MindmapNode';
import MindmapEdgeBlock from './MindmapEdge';
import { Button } from '@/components/ui/button';
import { useShortcuts } from '../hooks/useShortcut';

const nodeTypes = {
  mindMapNode: MindMapNodeBlock,
};

const edgeTypes = {
  mindmapEdge: MindmapEdgeBlock,
};

const MindMapInstructions = () => {
  return (
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
  );
};

const MindMap = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteSelectedNodes,
    selectAllNodes,
  } = useMindmap();

  useShortcuts([
    {
      key: 'Ctrl+A',
      callback: selectAllNodes,
    },
  ]);

  const proOptions = { hideAttribution: true };

  return (
    <div className="h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
      {/* Toolbar */}
      <div className="absolute left-4 top-4 z-10 flex gap-2">
        <Button onClick={addNode} title="Add new node" variant={'default'}>
          <Plus size={16} />
          Add Node
        </Button>

        <Button onClick={deleteSelectedNodes} title="Delete selected nodes" variant="destructive">
          <Trash2 size={16} />
          Delete Selected
        </Button>

        <Button
          variant={'outline'}
          onClick={() => {
            console.log(nodes);
            console.log(edges);
          }}
        >
          <span className="sr-only">Log Nodes and Edges</span>
          <Trash2 size={16} />
          Log Data
        </Button>
      </div>

      {/* Instructions */}
      <MindMapInstructions />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        onClick={resetSelectionOnClick()}
      >
        <Controls />

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

        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  );
};

export default MindMap;

function resetSelectionOnClick() {
  return (event: any) => {
    if (window.getSelection) {
      const selection = window.getSelection();

      if (
        selection &&
        typeof event.target.className === 'string' &&
        event.target.className.includes('react-flow__pane')
      ) {
        selection.removeAllRanges();
      }
    }
  };
}
