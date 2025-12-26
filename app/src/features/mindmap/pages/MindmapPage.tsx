import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, MiniMap } from '@xyflow/react';
import { PanelRight, PanelRightOpen, ArrowLeft, Sliders, X } from 'lucide-react';
import {
  Flow,
  LogicHandler,
  Toolbar,
  MindmapTitleInput,
  MindmapControls,
} from '@/features/mindmap/components';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useCoreStore, usePresenterModeStore, useViewModeStore } from '../stores';
import { useMindmapDirtyTracking } from '../hooks/useDirtyTracking';
import { useFullscreen } from '../hooks/useFullscreen';
import { usePresenterMode } from '../hooks/usePresenterMode';
import { useUnsavedChangesBlocker, useResponsiveBreakpoint } from '@/shared/hooks';
import { useSidebar } from '@/shared/components/ui/sidebar';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { PresenterProvider } from '../contexts/ReadOnlyContext';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';
import { SmallScreenDialog } from '@/shared/components/modals/SmallScreenDialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
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
  const { mindmap } = useLoaderData() as { mindmap: Mindmap };
  const setNodes = useCoreStore((state) => state.setNodes);
  const setEdges = useCoreStore((state) => state.setEdges);
  const { isDesktop } = useResponsiveBreakpoint();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [isPanOnDrag, setIsPanOnDrag] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(isDesktop);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);

  // Track dirty state changes
  useMindmapDirtyTracking();

  // Fullscreen functionality
  const { isFullscreen, toggleFullscreen: toggleFullscreenMode } = useFullscreen();
  const { setFullscreen } = useSidebar();

  // Presenter mode functionality (user can toggle)
  const { isPresenterMode, togglePresenterMode } = usePresenterMode();
  const setPresenterModeStore = usePresenterModeStore((state) => state.setPresenterMode);

  // View mode functionality (server-driven, cannot toggle)
  const setViewMode = useViewModeStore((state) => state.setViewMode);

  // Handle unsaved changes blocking
  const { showDialog, setShowDialog, handleStay, handleProceed } = useUnsavedChangesBlocker({
    eventName: 'app.mindmap.dirty-state-changed',
  });

  // Sync fullscreen state with sidebar
  useEffect(() => {
    setFullscreen(isFullscreen);
  }, [isFullscreen, setFullscreen]);

  // Sync presenter mode state to store for use in zustand stores
  useEffect(() => {
    setPresenterModeStore(isPresenterMode);
  }, [isPresenterMode, setPresenterModeStore]);

  // Set View Mode based on mindmap permissions from server
  // 'read' and 'comment' permissions are view-only, 'edit' allows full editing
  useEffect(() => {
    const isViewOnly = mindmap?.permission === 'read' || mindmap?.permission === 'comment';
    setViewMode(isViewOnly);
  }, [mindmap?.permission, setViewMode]);

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
        <PresenterProvider isPresenterMode={isPresenterMode}>
          <div className="flex h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
            <Flow isPanOnDrag={isPanOnDrag} isPresenterMode={isPresenterMode}>
              {/* Controls - always visible on desktop, toggleable on mobile */}
              {isDesktop ? (
                // Desktop: Always visible controls
                <div className={`bottom-4 left-4 z-10 ${isMobile ? 'fixed' : 'absolute'}`}>
                  <MindmapControls
                    isPanOnDrag={isPanOnDrag}
                    isPresenterMode={isPresenterMode}
                    isFullscreen={isFullscreen}
                    onTogglePanOnDrag={togglePanOnDrag}
                    onToggleFullscreen={toggleFullscreenMode}
                    onTogglePresenterMode={togglePresenterMode}
                  />
                </div>
              ) : (
                // Mobile: Expandable controls with toggle button
                <div className="fixed bottom-4 left-4 z-10 flex flex-col items-start">
                  {/* Controls container with animation - expands upward */}
                  <div
                    className={`origin-bottom transition-all duration-300 ease-in-out ${
                      isControlsExpanded
                        ? 'scale-y-100 opacity-100'
                        : 'pointer-events-none scale-y-0 opacity-0'
                    }`}
                  >
                    <div className="mb-2">
                      <MindmapControls
                        isPanOnDrag={isPanOnDrag}
                        isPresenterMode={isPresenterMode}
                        isFullscreen={isFullscreen}
                        onTogglePanOnDrag={togglePanOnDrag}
                        onToggleFullscreen={toggleFullscreenMode}
                        onTogglePresenterMode={togglePresenterMode}
                      />
                    </div>
                  </div>

                  {/* Toggle button - always at the bottom */}
                  <Button
                    onClick={() => setIsControlsExpanded(!isControlsExpanded)}
                    variant="outline"
                    size="icon"
                    className="touch-manipulation shadow-md"
                    title={isControlsExpanded ? 'Hide Controls' : 'Show Controls'}
                  >
                    {isControlsExpanded ? <X size={18} /> : <Sliders size={18} />}
                  </Button>
                </div>
              )}

              {!isPresenterMode && (
                <div className={`right-4 top-4 z-10 flex gap-2 ${isMobile ? 'fixed' : 'absolute'}`}>
                  <Button
                    onClick={() => setIsToolbarVisible(!isToolbarVisible)}
                    title={isToolbarVisible ? 'Hide Toolbar' : 'Show Toolbar'}
                    variant="outline"
                    size="icon"
                    className="touch-manipulation shadow-md"
                  >
                    {isToolbarVisible ? <PanelRightOpen size={18} /> : <PanelRight size={18} />}
                  </Button>
                </div>
              )}

              {!isPresenterMode && (
                <MiniMap
                  className="!border-border !mb-4 !mr-4 hidden !bg-white/90 lg:block"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--muted)',
                  }}
                  nodeStrokeColor="var(--primary)"
                  nodeColor="var(--primary)"
                  nodeBorderRadius={8}
                  position="bottom-right"
                />
              )}

              {/* Back button for desktop */}
              {isDesktop && (
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  size="icon"
                  className={`left-4 top-4 z-10 h-10 w-10 shadow-md ${isMobile ? 'fixed' : 'absolute'}`}
                  title="Go back"
                >
                  <ArrowLeft size={18} />
                </Button>
              )}
              <MindmapTitleInput
                mindmapId={mindmap.id}
                initialTitle={mindmap.title}
                hasBackButton={isDesktop}
                isPresenterMode={isPresenterMode}
              />

              <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
              <LogicHandler mindmapId={mindmap.id} isPresenterMode={isPresenterMode} />
            </Flow>
            {!isPresenterMode &&
              isToolbarVisible &&
              (isDesktop ? (
                <Toolbar mindmapId={mindmap.id} />
              ) : (
                <Sheet open={isToolbarVisible} onOpenChange={setIsToolbarVisible}>
                  <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 sm:h-[80vh]">
                    <SheetHeader className="border-b px-4 pb-2 pt-4">
                      <SheetTitle>Toolbar</SheetTitle>
                    </SheetHeader>
                    <div className="h-[calc(100%-60px)] overflow-y-auto">
                      <Toolbar mindmapId={mindmap.id} isMobileSheet={true} />
                    </div>
                  </SheetContent>
                </Sheet>
              ))}
          </div>
        </PresenterProvider>
      </ReactFlowProvider>
      <UnsavedChangesDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onStay={handleStay}
        onLeave={handleProceed}
      />
      <SmallScreenDialog />
    </>
  );
};

export default MindmapPage;
