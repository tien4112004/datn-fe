import { ReactFlow } from '@xyflow/react';
import { memo, useState, useEffect, type ReactNode, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Loader2 } from 'lucide-react';
import { useReactFlowIntegration } from '@/features/mindmap/hooks';
import { useMindmapPermissionContext } from '../../contexts/MindmapPermissionContext';
import EdgeBlock, { ConnectionLine } from '../edge/Edge';
import RootNodeBlock from '../node/RootNode';
import ShapeNodeBlock from '../node/ShapeNode';
import TextNodeBlock from '../node/TextNode';
import ImageNodeBlock from '../node/ImageNode';
import { useCoreStore, useLayoutStore } from '../../stores';

/**
 * @deprecated ShapeNodeBlock and ImageNodeBlock are deprecated and will be removed in a future version.
 * Consider using TextNode or other alternative node types instead.
 */
import { useMemo } from 'react';

const handlersSelector = (state: any) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const Flow = memo(({ children, isPanOnDrag }: { children: ReactNode; isPanOnDrag: boolean }) => {
  const [isInitializing, setIsInitializing] = useState(true);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useCoreStore(
    useShallow(handlersSelector)
  );

  // Get read-only state from permission context
  const { isReadOnly } = useMindmapPermissionContext();

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
  } = useReactFlowIntegration();

  // Memoize nodeTypes and edgeTypes to prevent unnecessary re-renders in ReactFlow
  const nodeTypes = useMemo(
    () => ({
      mindmapTextNode: TextNodeBlock,
      mindmapRootNode: RootNodeBlock,
      /** @deprecated - Use TextNode or other alternatives instead */
      mindmapShapeNode: ShapeNodeBlock,
      /** @deprecated - Use TextNode or other alternatives instead */
      mindmapImageNode: ImageNodeBlock,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      mindmapEdge: EdgeBlock,
    }),
    []
  );

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  // Simple fixed-duration loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return useLayoutStore.subscribe((state) => {
      if (containerRef.current) {
        if (state.isLayouting) {
          containerRef.current.classList.add('layouting-mode');
        } else {
          containerRef.current.classList.remove('layouting-mode');
        }
      }
    });
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      {isInitializing && (
        <div className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        onPaneMouseMove={onPaneMouseMove}
        onPaneClick={onPaneClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onInit={onInit}
        onConnectEnd={onConnectEnd}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        connectionLineComponent={ConnectionLine}
        panOnDrag={isPanOnDrag}
        panActivationKeyCode={!isPanOnDrag ? 'Shift' : null}
        selectionOnDrag={!isPanOnDrag}
        selectNodesOnDrag={false}
        selectionKeyCode={isPanOnDrag ? 'Shift' : null}
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
      >
        {children}
      </ReactFlow>
    </div>
  );
});

export default Flow;
