import { ReactFlow } from '@xyflow/react';
import { memo, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useReactFlowIntegration } from '@/features/mindmap/hooks';
import EdgeBlock, { ConnectionLine } from '../edge/Edge';
import RootNodeBlock from '../node/RootNode';
import ShapeNodeBlock from '../node/ShapeNode';
import TextNodeBlock from '../node/TextNode';
import ImageNodeBlock from '../node/ImageNode';
import { useCoreStore } from '../../stores';

/**
 * @deprecated ShapeNodeBlock and ImageNodeBlock are deprecated and will be removed in a future version.
 * Consider using TextNode or other alternative node types instead.
 */
const nodeTypes = {
  mindmapTextNode: TextNodeBlock,
  mindmapRootNode: RootNodeBlock,
  /** @deprecated - Use TextNode or other alternatives instead */
  mindmapShapeNode: ShapeNodeBlock,
  /** @deprecated - Use TextNode or other alternatives instead */
  mindmapImageNode: ImageNodeBlock,
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
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useCoreStore(
    useShallow(handlersSelector)
  );

  const {
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    onPaneMouseMove,
    onPaneClick,
    onInit,
    onConnectEnd,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onSelectionChange,
  } = useReactFlowIntegration();

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
      onInit={onInit}
      onConnectEnd={onConnectEnd}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      onSelectionChange={onSelectionChange}
      connectionLineComponent={ConnectionLine}
      panOnDrag={isPanOnDrag}
      panActivationKeyCode={!isPanOnDrag ? 'Shift' : null}
      selectionOnDrag={!isPanOnDrag}
      selectNodesOnDrag={false}
      selectionKeyCode={isPanOnDrag ? 'Shift' : null}
    >
      {children}
    </ReactFlow>
  );
});

export default Flow;
