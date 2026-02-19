import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, MiniMap } from '@xyflow/react';
import { MessageSquare, PanelRight, PanelRightOpen, X } from 'lucide-react';
import { Flow, LogicHandler, Toolbar, MindmapControls } from '@/features/mindmap/components';
import { Button } from '@ui/button';
import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCoreStore } from '../stores';
import type { Mindmap } from '../types';
import { MindmapPermissionProvider } from '../contexts/MindmapPermissionContext';

/**
 * Migrate layout data from mindmap metadata to root nodes.
 * This ensures backward compatibility with mindmaps that stored layout data globally.
 */
import { migrateLayoutDataToRootNodes } from '../utils/layoutUtils';
import { useCommentDrawerTrigger } from '../hooks';
import { CommentDrawer } from '@/features/comments';

/**
 * MindmapEmbedPage - Public mindmap viewer for webview embedding.
 *
 * Key differences from MindmapPage:
 * - No authentication required (uses public API endpoint)
 * - Forced view-only mode
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
  const { i18n } = useTranslation();

  const [isPanOnDrag, setIsPanOnDrag] = useState(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);

  const userPermission = mindmap?.permission;

  // Apply locale from URL (from Flutter) or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLocale = urlParams.get('locale');
    const savedLocale = localStorage.getItem('i18nextLng');
    const localeToApply = urlLocale || savedLocale;

    if (localeToApply && localeToApply !== i18n.language) {
      i18n.changeLanguage(localeToApply);
      // Save to localStorage so it persists
      if (urlLocale) {
        localStorage.setItem('i18nextLng', urlLocale);
      }
    }
  }, [i18n]);

  // Fullscreen functionality

  // Sync mindmap data from React Router loader to stores
  useEffect(() => {
    if (mindmap) {
      // Migrate layout data from metadata to root nodes for backward compatibility
      const migratedNodes = migrateLayoutDataToRootNodes(mindmap.nodes, mindmap.metadata);

      setNodes(migratedNodes);
      setEdges(mindmap.edges);

      // Notify Flutter that mindmap is loaded (hides native loader)
      if ((window as any).flutter_inappwebview) {
        (window as any).flutter_inappwebview.callHandler('mindmapLoaded', {
          success: true,
          nodeCount: migratedNodes.length,
        });
      }
    }
  }, [mindmap, setNodes, setEdges]);

  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  const togglePanOnDrag = () => {
    setIsPanOnDrag(!isPanOnDrag);
  };

  useCommentDrawerTrigger(() => setIsCommentDrawerOpen(true));

  return (
    <ReactFlowProvider>
      <MindmapPermissionProvider isPresenterMode={false} userPermission={userPermission}>
        <div
          className="fixed inset-0 flex h-full w-full overflow-hidden"
          style={{ backgroundColor: 'var(--background)', touchAction: 'none' }}
        >
          <Flow isPanOnDrag={true}>
            {/* Controls */}
            <div className={`fixed bottom-4 left-4 z-10`}>
              <MindmapControls
                isPanOnDrag={true}
                isPresenterMode={false}
                isFullscreen={false}
                onTogglePanOnDrag={togglePanOnDrag}
                onToggleFullscreen={null}
                onTogglePresenterMode={null}
              />
            </div>

            <div className={`fixed right-4 top-4 z-10 flex gap-2`}>
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
          {/* Toolbar */}
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
        </div>

        <CommentDrawer
          isOpen={isCommentDrawerOpen}
          onOpenChange={setIsCommentDrawerOpen}
          documentId={mindmap.id}
          documentType="mindmap"
          userPermission={userPermission || 'read'}
        />
      </MindmapPermissionProvider>
    </ReactFlowProvider>
  );
};

export default MindmapEmbedPage;
