import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, MiniMap } from '@xyflow/react';
import { Flow, LogicHandler, Toolbar, MindmapControls } from '@/features/mindmap/components';
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

  const togglePanOnDrag = () => {
    setIsPanOnDrag(!isPanOnDrag);
  };

  return (
    <ReactFlowProvider>
      <PresenterProvider isPresenterMode={false}>
        <div className="flex h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
          <Flow isPanOnDrag={isPanOnDrag} isPresenterMode={false}>
            {/* Controls - simplified for embed */}
            {isDesktop && (
              <div className={`bottom-4 left-4 z-10 ${isMobile ? 'fixed' : 'absolute'}`}>
                <MindmapControls
                  isPanOnDrag={isPanOnDrag}
                  isPresenterMode={false}
                  isFullscreen={isFullscreen}
                  onTogglePanOnDrag={togglePanOnDrag}
                  onToggleFullscreen={toggleFullscreenMode}
                  onTogglePresenterMode={() => {}} // No-op for embed (view-only)
                />
              </div>
            )}

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
          {/* Toolbar - always visible in read-only mode */}
          <Toolbar mindmapId={mindmap.id} />
        </div>
      </PresenterProvider>
    </ReactFlowProvider>
  );
};

export default MindmapEmbedPage;
