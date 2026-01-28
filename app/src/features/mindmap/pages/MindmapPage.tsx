import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, MiniMap } from '@xyflow/react';
import { PanelRight, PanelRightOpen, X, MessageSquare } from 'lucide-react';
import {
  Flow,
  LogicHandler,
  Toolbar,
  MindmapBreadcrumbHeader,
  MindmapControls,
} from '@/features/mindmap/components';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLoaderData } from 'react-router-dom';
import { useCoreStore, usePresenterModeStore } from '../stores';
import { useDirtyStore } from '../stores/dirty';
import { useMindmapDirtyTracking } from '../hooks/useDirtyTracking';
import { useFullscreen } from '../hooks/useFullscreen';
import { usePresenterMode } from '../hooks/usePresenterMode';
import { useCommentDrawerTrigger } from '../hooks/useCommentDrawer';
import { useUnsavedChangesBlocker, useResponsiveBreakpoint, useIsMobile } from '@/shared/hooks';
import { useSidebar } from '@/shared/components/ui/sidebar';
import { MindmapPermissionProvider } from '../contexts/MindmapPermissionContext';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';
import { SmallScreenDialog } from '@/shared/components/modals/SmallScreenDialog';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';
import { useSavingStore } from '../stores/saving';
import { CommentDrawer } from '@/features/comments';
import type { Mindmap, MindMapNode } from '../types';
import { MINDMAP_TYPES } from '../types';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

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
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
  const setNodes = useCoreStore((state) => state.setNodes);
  const setEdges = useCoreStore((state) => state.setEdges);
  const { isDesktop } = useResponsiveBreakpoint();
  const isMobile = useIsMobile();

  const [isPanOnDrag, setIsPanOnDrag] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(isDesktop);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const userPermission = mindmap?.permission;

  // Track dirty state changes - only if user can edit
  useMindmapDirtyTracking(userPermission === 'edit');

  // Track saving and duplicating state
  const isSaving = useSavingStore((state) => state.isSaving);
  const isDuplicating = useSavingStore((state) => state.isDuplicating);

  // Fullscreen functionality
  const { isFullscreen, toggleFullscreen: toggleFullscreenMode } = useFullscreen();
  const { setFullscreen } = useSidebar();

  // Presenter mode functionality (user can toggle)
  const { isPresenterMode, togglePresenterMode } = usePresenterMode();
  const setPresenterModeStore = usePresenterModeStore((state) => state.setPresenterMode);

  // Permission state

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

  // Reset dirty state when component mounts (navigating to a mindmap)
  const resetDirty = useDirtyStore((state) => state.reset);

  // Sync mindmap data from React Router loader to stores
  useEffect(() => {
    if (mindmap) {
      // Migrate layout data from metadata to root nodes for backward compatibility
      const migratedNodes = migrateLayoutDataToRootNodes(mindmap.nodes, mindmap.metadata);

      setNodes(migratedNodes);
      setEdges(mindmap.edges);

      // Reset dirty state after loading data - this is not a user edit
      // Use setTimeout to ensure this runs after dirty tracking detects the "change"
      setTimeout(() => {
        resetDirty();
      }, 0);
    }
  }, [mindmap, setNodes, setEdges, resetDirty]);

  const togglePanOnDrag = () => {
    setIsPanOnDrag(!isPanOnDrag);
  };

  return (
    <>
      <ReactFlowProvider>
        <MindmapPermissionProvider isPresenterMode={isPresenterMode} userPermission={userPermission}>
          <div className="flex h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
            <Flow isPanOnDrag={isPanOnDrag}>
              {/* Breadcrumb Header */}
              <MindmapBreadcrumbHeader mindmapId={mindmap.id} initialTitle={mindmap.title} />
              {/* Controls */}
              <div className={`absolute bottom-4 left-4 z-10`}>
                <MindmapControls
                  isPanOnDrag={isPanOnDrag}
                  isPresenterMode={isPresenterMode}
                  isFullscreen={isFullscreen}
                  onTogglePanOnDrag={togglePanOnDrag}
                  onToggleFullscreen={isMobile ? null : toggleFullscreenMode}
                  onTogglePresenterMode={isMobile ? null : togglePresenterMode}
                />
              </div>

              {!isPresenterMode && (
                <div className={`absolute right-4 top-4 z-10 flex gap-2`}>
                  <Button
                    onClick={() => setIsCommentDrawerOpen(true)}
                    title="Comments"
                    variant="outline"
                    size="icon"
                    className="touch-manipulation shadow-md"
                  >
                    <MessageSquare size={18} />
                  </Button>
                  {userPermission === 'edit' && (
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
              userPermission === 'edit' &&
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
        </MindmapPermissionProvider>
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
      {isSaving && <GlobalSpinner text={t('toolbar.save.saving')} />}
      {isDuplicating && <GlobalSpinner text={t('toolbar.actions.duplicateLoading')} />}
    </>
  );
};

export default MindmapPage;
