import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, MiniMap } from '@xyflow/react';
import { PanelRight, PanelRightOpen, Sliders, X } from 'lucide-react';
import { Flow, LogicHandler, Toolbar, MindmapControls } from '@/features/mindmap/components';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useCoreStore, useViewModeStore } from '../stores';
import { useFullscreen } from '../hooks/useFullscreen';
import { useResponsiveBreakpoint } from '@/shared/hooks';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { PresenterProvider } from '../contexts/ReadOnlyContext';
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

/**
 * MindmapEmbedPage - Public mindmap viewer for webview embedding.
 *
 * Key differences from MindmapPage:
 * - No authentication required (uses public API endpoint)
 * - Forced view-only mode
 * - No breadcrumb header
 * - No unsaved changes tracking/blocking
 * - Full UI preserved (TreePanel, Flow, Toolbar, Controls, MiniMap)
 *
 * Route: /mindmap/embed/:id (public route)
 * Data loader: getPublicMindmapById from embedLoaders.ts
 */
const MindmapEmbedPage = () => {
  const { mindmap } = useLoaderData() as { mindmap: Mindmap };
  const setNodes = useCoreStore((state) => state.setNodes);
  const setEdges = useCoreStore((state) => state.setEdges);
  const { isDesktop } = useResponsiveBreakpoint();
  const isMobile = useIsMobile();
  const setViewMode = useViewModeStore((state) => state.setViewMode);

  const [isPanOnDrag, setIsPanOnDrag] = useState(false);

  // Fullscreen functionality
  const { isFullscreen, toggleFullscreen: toggleFullscreenMode } = useFullscreen();

  // Force view-only mode for embed page (security)
  useEffect(() => {
    setViewMode(true);
  }, [setViewMode]);

  // Sync mindmap data from React Router loader to stores
  useEffect(() => {
    if (mindmap) {
      // Migrate layout data from metadata to root nodes for backward compatibility
      const migratedNodes = migrateLayoutDataToRootNodes(mindmap.nodes, mindmap.metadata);

      setNodes(migratedNodes);
      setEdges(mindmap.edges);
    }
  }, [mindmap, setNodes, setEdges]);

  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(isDesktop);

  const togglePanOnDrag = () => {
    setIsPanOnDrag(!isPanOnDrag);
  };

  return (
    <ReactFlowProvider>
      <PresenterProvider isPresenterMode={false}>
        <div
          className="fixed inset-0 flex h-full w-full overflow-hidden"
          style={{ backgroundColor: 'var(--background)', touchAction: 'none' }}
        >
          <Flow isPanOnDrag={true} isPresenterMode={false}>
            {/* Controls - always visible on desktop, toggleable on mobile */}
            {isDesktop ? (
              // Desktop: Always visible controls
              <div className={`bottom-4 left-4 z-10 ${isMobile ? 'fixed' : 'absolute'}`}>
                <MindmapControls
                  isPanOnDrag={true}
                  isPresenterMode={false}
                  isFullscreen={isFullscreen}
                  onTogglePanOnDrag={togglePanOnDrag}
                  onToggleFullscreen={toggleFullscreenMode}
                  onTogglePresenterMode={() => {}} // No-op for embed (view-only)
                />
              </div>
            ) : (
              // Mobile: Expandable controls with toggle button
              <div className="fixed bottom-4 left-4 z-10 flex flex-col items-start">
                {/* Controls container with animation - expands upward */}
                <div
                  className={`origin-bottom transition-all duration-300 ease-in-out ${
                    isControlsExpanded ? 'scale-y-100 opacity-100' : 'pointer-events-none scale-y-0 opacity-0'
                  }`}
                >
                  <div className="mb-2">
                    <MindmapControls
                      isPanOnDrag={true}
                      isPresenterMode={false}
                      isFullscreen={isFullscreen}
                      onTogglePanOnDrag={togglePanOnDrag}
                      onToggleFullscreen={toggleFullscreenMode}
                      onTogglePresenterMode={() => {}} // No-op for embed (view-only)
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

            {/* MiniMap - hidden on mobile for better UX */}
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

            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <LogicHandler mindmapId={mindmap.id} isPresenterMode={false} metadata={mindmap.metadata} />
          </Flow>

          {/* Toolbar - Responsive implementation */}
          {isDesktop ? (
            isToolbarVisible && <Toolbar mindmapId={mindmap.id} />
          ) : (
            <>
              {/* Custom Mobile Bottom Sheet */}
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
                  <Toolbar mindmapId={mindmap.id} isMobileSheet={true} />
                </div>
              </div>
            </>
          )}
        </div>
      </PresenterProvider>
    </ReactFlowProvider>
  );
};

export default MindmapEmbedPage;
