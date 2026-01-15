import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, MiniMap } from '@xyflow/react';
import { PanelRight, PanelRightOpen, Sliders, X, MessageSquare } from 'lucide-react';
import {
  Flow,
  LogicHandler,
  Toolbar,
  MindmapBreadcrumbHeader,
  MindmapControls,
} from '@/features/mindmap/components';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import { useCoreStore, usePresenterModeStore, useViewModeStore } from '../stores';
import { useMindmapDirtyTracking } from '../hooks/useDirtyTracking';
import { useFullscreen } from '../hooks/useFullscreen';
import { usePresenterMode } from '../hooks/usePresenterMode';
import { useCommentDrawerTrigger } from '../hooks/useCommentDrawer';
import { useUnsavedChangesBlocker, useResponsiveBreakpoint } from '@/shared/hooks';
import { useSidebar } from '@/shared/components/ui/sidebar';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { PresenterProvider } from '../contexts/ReadOnlyContext';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';
import { SmallScreenDialog } from '@/shared/components/modals/SmallScreenDialog';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';
import { useSavingStore } from '../stores/saving';
import { CommentDrawer } from '@/features/comments';
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
  const [searchParams] = useSearchParams();

  const [isPanOnDrag, setIsPanOnDrag] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(isDesktop);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);

  // Track dirty state changes
  useMindmapDirtyTracking();

  // Track saving state
  const isSaving = useSavingStore((state) => state.isSaving);

  // Fullscreen functionality
  const { isFullscreen, toggleFullscreen: toggleFullscreenMode } = useFullscreen();
  const { setFullscreen } = useSidebar();

  // Presenter mode functionality (user can toggle)
  const { isPresenterMode, togglePresenterMode } = usePresenterMode();
  const setPresenterModeStore = usePresenterModeStore((state) => state.setPresenterMode);

  // View mode functionality (URL-driven, cannot toggle)
  const isViewMode = useViewModeStore((state) => state.isViewMode);
  const setViewMode = useViewModeStore((state) => state.setViewMode);

  // Permission state
  const userPermission = mindmap?.permission;

  // Listen for comment drawer open requests
  useCommentDrawerTrigger(() => setIsCommentDrawerOpen(true));

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

  // Set View Mode based on URL search params and user permission
  // - read permission: always 'view' (read-only)
  // - comment permission: always 'view' (can view and comment, but not edit)
  // - edit permission: respects ?view parameter toggle
  // - undefined permission: respects ?view parameter (default behavior)
  useEffect(() => {
    const isViewModeParam = searchParams.has('view');
    // Force view mode if user has read or comment permission
    const shouldBeViewMode =
      userPermission === 'read' || userPermission === 'comment' ? true : isViewModeParam;
    setViewMode(shouldBeViewMode);
  }, [searchParams, setViewMode, userPermission]);

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
        <PresenterProvider isPresenterMode={isPresenterMode} isViewMode={isViewMode}>
          <div className="flex h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
            <Flow isPanOnDrag={isPanOnDrag} isPresenterMode={isPresenterMode} isViewMode={isViewMode}>
              {/* Breadcrumb Header */}
              <MindmapBreadcrumbHeader
                mindmapId={mindmap.id}
                initialTitle={mindmap.title}
                isPresenterMode={isPresenterMode}
                isViewMode={isViewMode}
              />
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
                !isPresenterMode && (
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

                    {/* Action buttons - always at the bottom */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsCommentDrawerOpen(true)}
                        variant="outline"
                        size="icon"
                        className="touch-manipulation shadow-md"
                        title="Comments"
                      >
                        <MessageSquare size={18} />
                      </Button>
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
                  </div>
                )
              )}

              {!isPresenterMode && (
                <div className={`right-4 top-4 z-10 flex gap-2 ${isMobile ? 'fixed' : 'absolute'}`}>
                  <Button
                    onClick={() => setIsCommentDrawerOpen(true)}
                    title="Comments"
                    variant="outline"
                    size="icon"
                    className="touch-manipulation shadow-md"
                  >
                    <MessageSquare size={18} />
                  </Button>
                  {!isViewMode && (
                    <Button
                      onClick={() => setIsToolbarVisible(!isToolbarVisible)}
                      title={isToolbarVisible ? 'Hide Toolbar' : 'Show Toolbar'}
                      variant="outline"
                      size="icon"
                      className="touch-manipulation shadow-md"
                    >
                      {isToolbarVisible ? <PanelRightOpen size={18} /> : <PanelRight size={18} />}
                    </Button>
                  )}
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

              <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
              <LogicHandler
                mindmapId={mindmap.id}
                isPresenterMode={isPresenterMode}
                metadata={mindmap.metadata}
              />
            </Flow>
            {!isPresenterMode &&
              !isViewMode &&
              isToolbarVisible &&
              (isDesktop ? (
                <Toolbar mindmapId={mindmap.id} permission={mindmap.permission} />
              ) : (
                <div
                  className={`bg-background fixed bottom-0 left-0 right-0 z-50 flex h-[40vh] flex-col rounded-t-2xl border-t shadow-lg transition-transform duration-300 ease-in-out sm:h-[65vh] ${
                    isToolbarVisible ? 'translate-y-0' : 'translate-y-full'
                  }`}
                  style={{ willChange: 'transform', touchAction: 'none' }}
                >
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <span className="font-semibold">Toolbar</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="-mr-2 h-8 w-8"
                      onClick={() => setIsToolbarVisible(false)}
                    >
                      <X size={18} />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
                    <Toolbar mindmapId={mindmap.id} isMobileSheet={true} permission={mindmap.permission} />
                  </div>
                </div>
              ))}
          </div>
        </PresenterProvider>
      </ReactFlowProvider>

      {/* Comment Drawer - Triggered via 'app.mindmap.open-comments' event or button click */}
      <CommentDrawer
        isOpen={isCommentDrawerOpen}
        onOpenChange={setIsCommentDrawerOpen}
        documentId={mindmap.id}
        documentType="mindmap"
        userPermission={userPermission || 'read'}
      />

      <UnsavedChangesDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onStay={handleStay}
        onLeave={handleProceed}
      />
      <SmallScreenDialog />
      {isSaving && <GlobalSpinner text="Saving mindmap..." />}
    </>
  );
};

export default MindmapPage;
