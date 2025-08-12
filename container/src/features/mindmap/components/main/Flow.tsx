import { ReactFlow } from '@xyflow/react';
import { memo, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useReactFlowIntegration } from '@/features/mindmap/hooks';
import { useMindmapStore } from '@/features/mindmap/stores';
import EdgeBlock from '../edge/Edge';
import RootNodeBlock from '../node/RootNode';
import ShapeNodeBlock from '../node/ShapeNode';
import TextNodeBlock from '../node/TextNode';

const nodeTypes = {
  mindMapNode: TextNodeBlock,
  mindMapRootNode: RootNodeBlock,
  mindmapShapeNode: ShapeNodeBlock,
};

const edgeTypes = {
  mindmapEdge: EdgeBlock,
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

  //   console.log('Rerender');

  //   useWhyDidYouUpdate('MindMap', { nodes, edges, onNodesChange, onEdgesChange, onConnect });

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

export default Flow;
