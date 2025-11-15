import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, Controls, MiniMap, ControlButton } from '@xyflow/react';
import { Move, MousePointer2, Loader2 } from 'lucide-react';
import { DevTools } from '@/features/mindmap/components/ui/devtools';
import { Flow, LogicHandler, Toolbar } from '@/features/mindmap/components';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMindmapById } from '../hooks/useApi';
import { useCoreStore } from '../stores';

const MindmapPage = () => {
  const [isPanOnDrag, setIsPanOnDrag] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { data: mindmap, isLoading, error } = useMindmapById(id || undefined);
  const setNodes = useCoreStore((state) => state.setNodes);
  const setEdges = useCoreStore((state) => state.setEdges);

  // Sync mindmap data from React Query cache to React Flow
  useEffect(() => {
    if (mindmap) {
      setNodes(mindmap.nodes);
      setEdges(mindmap.edges);
    }
  }, [mindmap, setNodes, setEdges]);

  const togglePanOnDrag = () => {
    setIsPanOnDrag(!isPanOnDrag);
  };
  if (isLoading) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading mindmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">Failed to load mindmap</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!mindmap) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">Mindmap not found</p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
        <Toolbar />
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
            position="top-left"
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
