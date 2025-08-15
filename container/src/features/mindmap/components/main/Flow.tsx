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
  mindmapTextNode: TextNodeBlock,
  mindmapRootNode: RootNodeBlock,
  mindmapShapeNode: ShapeNodeBlock,
};

const edgeTypes = {
  mindmapEdge: EdgeBlock,
};

const handlersSelector = (state: any) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const Flow = memo(({ children, isPanOnDrag }: { children: ReactNode; isPanOnDrag: boolean }) => {
  const { onNodeDragStart, onNodeDrag, onNodeDragStop, onPaneMouseMove, onPaneClick } =
    useReactFlowIntegration();

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useMindmapStore(
    useShallow(handlersSelector)
  );

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
      onNodeDragStart={onNodeDragStart}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      panOnDrag={isPanOnDrag}
      panActivationKeyCode={!isPanOnDrag ? 'Shift' : null}
      selectionOnDrag={!isPanOnDrag}
      selectionKeyCode={isPanOnDrag ? 'Shift' : null}
      fitView
    >
      {children}
    </ReactFlow>
  );
});

export default Flow;
