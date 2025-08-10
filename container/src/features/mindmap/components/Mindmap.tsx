import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from '@xyflow/react';
import { useReactFlowIntegration } from '../hooks/useReactFlowIntegration';
import MindMapNodeBlock from './MindmapNode';
import MindmapEdgeBlock from './MindmapEdge';
import MindmapToolbar from './MindmapToolbar';
import MindmapInstructions from './MindmapInstructions';
import { useShortcuts, useMindmapActions } from '../hooks';
import { memo, useMemo } from 'react';
import { DevTools } from '@/components/devtools';

const nodeTypes = {
  mindMapNode: MindMapNodeBlock,
};

const edgeTypes = {
  mindmapEdge: MindmapEdgeBlock,
};

const MindMap = memo(() => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeDrag, onPaneMouseMove, onPaneClick } =
    useReactFlowIntegration();

  console.log('MindMap rendered');

  return (
    <div className="h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
      <MindmapToolbar />
      <MindmapInstructions />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{
          hideAttribution: true,
        }}
        onPaneMouseMove={onPaneMouseMove}
        onPaneClick={onPaneClick}
        onNodeDrag={onNodeDrag}
        fitView
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
        <DevTools position="bottom-left" />
        <LogicHandler />
      </ReactFlow>
    </div>
  );
});

const LogicHandler = () => {
  const {
    selectAllNodesAndEdges,
    copySelectedNodesAndEdges,
    pasteClonedNodesAndEdges,
    deleteSelectedNodes,
    deselectAllNodesAndEdges,
  } = useMindmapActions();

  const shortcuts = useMemo(
    () => [
      {
        key: 'Ctrl+A',
        callback: selectAllNodesAndEdges,
      },
      {
        key: 'Ctrl+C',
        callback: copySelectedNodesAndEdges,
      },
      {
        key: 'Ctrl+V',
        callback: pasteClonedNodesAndEdges,
      },
      {
        key: 'Delete',
        callback: deleteSelectedNodes,
      },
      {
        key: 'Escape',
        callback: deselectAllNodesAndEdges,
      },
    ],
    [
      selectAllNodesAndEdges,
      copySelectedNodesAndEdges,
      pasteClonedNodesAndEdges,
      deleteSelectedNodes,
      deselectAllNodesAndEdges,
    ]
  );

  useShortcuts(shortcuts);

  return null;
};

export default MindMap;
