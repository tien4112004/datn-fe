import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, Controls, MiniMap, ControlButton } from '@xyflow/react';
import { Move, MousePointer2 } from 'lucide-react';
import { DevTools } from '@/features/mindmap/components/ui/devtools';
import { Flow, LogicHandler, Toolbar, MindmapTitleInput } from '@/features/mindmap/components';
import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useCoreStore, useLayoutStore, useMetadataStore } from '../stores';
import { useMindmapDirtyTracking } from '../hooks/useDirtyTracking';
import { useUnsavedChangesBlocker } from '@/shared/hooks';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';
import type { Mindmap } from '../types';

const MindmapPage = () => {
  const [isPanOnDrag, setIsPanOnDrag] = useState(false);
  const { mindmap } = useLoaderData() as { mindmap: Mindmap };
  const setNodes = useCoreStore((state) => state.setNodes);
  const setEdges = useCoreStore((state) => state.setEdges);
  const setLayout = useLayoutStore((state) => state.setLayout);
  const setLayoutType = useLayoutStore((state) => state.setLayoutType);
  const setAutoLayoutEnabled = useLayoutStore((state) => state.setAutoLayoutEnabled);
  const setMetadata = useMetadataStore((state) => state.setMetadata);

  // Track dirty state changes
  useMindmapDirtyTracking();

  // Handle unsaved changes blocking
  const { showDialog, setShowDialog, handleStay, handleProceed } = useUnsavedChangesBlocker({
    eventName: 'app.mindmap.dirty-state-changed',
  });

  // Sync mindmap data from React Router loader to stores
  useEffect(() => {
    if (mindmap) {
      setNodes(mindmap.nodes);
      setEdges(mindmap.edges);

      // Sync metadata if available
      if (mindmap.metadata) {
        setMetadata(mindmap.metadata);

        if (mindmap.metadata.layoutType) {
          setLayoutType(mindmap.metadata.layoutType);
        }

        if (mindmap.metadata.forceLayout) {
          setAutoLayoutEnabled(mindmap.metadata.forceLayout);
        }
      }
    }
  }, [mindmap, setNodes, setEdges, setLayout, setLayoutType, setMetadata, setAutoLayoutEnabled]);

  const togglePanOnDrag = () => {
    setIsPanOnDrag(!isPanOnDrag);
  };

  return (
    <>
      <ReactFlowProvider>
        <div className="flex h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
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
              className="!border-border !mb-4 !mr-4 !bg-white/90"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--muted)',
              }}
              nodeStrokeColor="var(--primary)"
              nodeColor="var(--primary)"
              nodeBorderRadius={8}
              position="bottom-right"
            />

            <MindmapTitleInput mindmapId={mindmap.id} initialTitle={mindmap.title} />

            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <DevTools position="bottom-center" />
            <LogicHandler mindmapId={mindmap.id} />
          </Flow>
          <Toolbar mindmapId={mindmap.id} />
        </div>
      </ReactFlowProvider>
      <UnsavedChangesDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onStay={handleStay}
        onLeave={handleProceed}
      />
    </>
  );
};

export default MindmapPage;
