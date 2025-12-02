import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, Controls, MiniMap, ControlButton } from '@xyflow/react';
import { Move, MousePointer2 } from 'lucide-react';
import { DevTools } from '@/features/mindmap/components/ui/devtools';
import { Flow, LogicHandler, Toolbar, MindmapTitleInput } from '@/features/mindmap/components';
import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useCoreStore } from '../stores';
import { useMindmapDirtyTracking } from '../hooks/useDirtyTracking';
import { useUnsavedChangesBlocker } from '@/shared/hooks';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';
import type { Mindmap, MindMapNode } from '../types';
import { MINDMAP_TYPES } from '../types';

/**
 * Migrate layout data from mindmap metadata to root nodes.
 * This ensures backward compatibility with mindmaps that stored layout data globally.
 */
const migrateLayoutDataToRootNodes = (
  nodes: MindMapNode[],
  metadata?: Mindmap['metadata']
): MindMapNode[] => {
  if (!metadata) return nodes;

  const { layoutType, forceLayout } = metadata;

  // If no layout data in metadata, return nodes as-is
  if (!layoutType && forceLayout === undefined) return nodes;

  // Apply layout data to all root nodes that don't have it set
  return nodes.map((node) => {
    if (node.type !== MINDMAP_TYPES.ROOT_NODE) return node;

    const rootNode = node;
    const needsLayoutType = layoutType && !rootNode.data.layoutType;
    const needsForceLayout = forceLayout !== undefined && rootNode.data.forceLayout === undefined;

    if (!needsLayoutType && !needsForceLayout) return node;

    return {
      ...rootNode,
      data: {
        ...rootNode.data,
        ...(needsLayoutType && { layoutType }),
        ...(needsForceLayout && { forceLayout }),
      },
    };
  });
};

const MindmapPage = () => {
  const [isPanOnDrag, setIsPanOnDrag] = useState(false);
  const { mindmap } = useLoaderData() as { mindmap: Mindmap };
  const setNodes = useCoreStore((state) => state.setNodes);
  const setEdges = useCoreStore((state) => state.setEdges);

  // Track dirty state changes
  useMindmapDirtyTracking();

  // Handle unsaved changes blocking
  const { showDialog, setShowDialog, handleStay, handleProceed } = useUnsavedChangesBlocker({
    eventName: 'app.mindmap.dirty-state-changed',
  });

  // Sync mindmap data from React Router loader to stores
  useEffect(() => {
    if (mindmap) {
      // Migrate layout data from metadata to root nodes for backward compatibility
      const migratedNodes = migrateLayoutDataToRootNodes(mindmap.nodes, mindmap.metadata);

      setNodes(migratedNodes);
      setEdges(mindmap.edges);
    }
  }, [mindmap, setNodes, setEdges]);

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
