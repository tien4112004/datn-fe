import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, Controls, MiniMap, ControlButton } from '@xyflow/react';
import { Move, MousePointer2 } from 'lucide-react';
import { DevTools } from '@/features/mindmap/components/ui/devtools';
import { Flow, LogicHandler, Instructions, Toolbar } from '@/features/mindmap/components';
import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import type { MindmapData } from '@/features/mindmap/types/service';
import { useCoreStore } from '../stores';

const MindmapPage = () => {
  const [isPanOnDrag, setIsPanOnDrag] = useState(false);
  const loaderData = useLoaderData() as { mindmap: MindmapData };
  const { setNodes, setEdges } = useCoreStore((state) => ({
    setNodes: state.setNodes,
    setEdges: state.setEdges,
  }));

  useEffect(() => {
    if (loaderData?.mindmap) {
      setNodes(loaderData.mindmap.nodes);
      setEdges(loaderData.mindmap.edges);
    }
  }, [loaderData, setNodes, setEdges]);

  const togglePanOnDrag = () => {
    setIsPanOnDrag(!isPanOnDrag);
  };

  return (
    <ReactFlowProvider>
      <div className="h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
        <Toolbar />
        <Instructions />
        <Flow isPanOnDrag={isPanOnDrag}>
          <Controls>
            <ControlButton
              onClick={togglePanOnDrag}
              title={isPanOnDrag ? 'Switch to Selection Mode' : 'Switch to Pan Mode'}
            >
              {isPanOnDrag ? <MousePointer2 size={16} /> : <Move size={16} />}
            </ControlButton>
          </Controls>

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
          <DevTools position="bottom-center" />
          <LogicHandler />
        </Flow>
      </div>
    </ReactFlowProvider>
  );
};

export default MindmapPage;
