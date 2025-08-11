import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from '@xyflow/react';
import { useReactFlowIntegration } from '../hooks/useReactFlowIntegration';
import MindMapNodeBlock from './MindmapNode';
import MindmapRootNodeBlock from './MindmapRootNode';
import MindmapEdgeBlock from './MindmapEdge';
import MindmapToolbar from './MindmapToolbar';
import MindmapInstructions from './MindmapInstructions';
import { useShortcuts, useMindmapActions } from '../hooks';
import { memo, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { DevTools } from '@/components/devtools';
import { useMindmapStore } from '../stores';
import { useShallow } from 'zustand/react/shallow';
import { useWhyDidYouUpdate } from '@/hooks/use-debug';

const nodeTypes = {
  mindMapNode: MindMapNodeBlock,
  mindMapRootNode: MindmapRootNodeBlock,
};

const edgeTypes = {
  mindmapEdge: MindmapEdgeBlock,
};

const Flow = memo(({ children }: { children: ReactNode }) => {
  const { onConnect, onNodeDrag, onPaneMouseMove, onPaneClick } = useReactFlowIntegration();
  const { nodes, edges, onNodesChange, onEdgesChange } = useMindmapStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
    }))
  );

  console.log('Rerender');

  useWhyDidYouUpdate('MindMap', { nodes, edges, onNodesChange, onEdgesChange, onConnect });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      proOptions={{ hideAttribution: true }}
      onPaneMouseMove={onPaneMouseMove}
      onPaneClick={onPaneClick}
      onNodeDrag={onNodeDrag}
      fitView
    >
      {children}
    </ReactFlow>
  );
});

const MindMap = memo(() => {
  return (
    <div className="h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
      <MindmapToolbar />
      <MindmapInstructions />
      <Flow>
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
      </Flow>
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
