import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, MiniMap } from '@xyflow/react';
import { MessageSquare, PanelRight, PanelRightOpen, X, Loader2 } from 'lucide-react';
import { Flow, LogicHandler, Toolbar, MindmapControls } from '@/features/mindmap/components';
import { Button } from '@ui/button';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCoreStore, useLayoutStore } from '../stores';
import {
  type Mindmap,
  type MindmapMobileGenerationRequest,
  type MindmapGenerateRequest,
  MINDMAP_TYPES,
} from '../types';
import { MindmapPermissionProvider } from '../contexts/MindmapPermissionContext';
import { migrateLayoutDataToRootNodes } from '../utils/layoutUtils';
import { useCommentDrawerTrigger, useGenerateMindmap, useUpdateMindmap } from '../hooks';
import { CommentDrawer } from '@/features/comments';
import { convertAiDataToMindMapNodes, DEFAULT_LAYOUT_TYPE } from '../services/utils';

/** Notify Flutter via InAppWebView JavaScript handler */
const notifyFlutter = (handler: string, data: Record<string, unknown>) => {
  if ((window as any).flutter_inappwebview) {
    (window as any).flutter_inappwebview.callHandler(handler, data);
  }
};

/**
 * MindmapEmbedPage - Public mindmap viewer for webview embedding.
 *
 * Key differences from MindmapPage:
 * - No authentication required (uses public API endpoint)
 * - Forced view-only mode
 * - No unsaved changes tracking/blocking
 * - Full UI preserved (TreePanel, Flow, Toolbar, Controls, MiniMap)
 *
 * Supports two modes:
 * - View mode (default): Display existing mindmap
 * - Generation mode (mode=generate): Generate mindmap content via AI
 *
 * Route: /mindmap/embed/:id (public route)
 * Route: /mindmap/embed/:id?mode=generate (generation mode from Flutter)
 * Data loader: getPublicMindmapById from embedLoaders.ts
 */
const MindmapEmbedPage = () => {
  const { mindmap } = useLoaderData() as { mindmap: Mindmap };
  const setNodes = useCoreStore((state) => state.setNodes);
  const setEdges = useCoreStore((state) => state.setEdges);
  const { t, i18n } = useTranslation('mindmap');

  const [isPanOnDrag, setIsPanOnDrag] = useState(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);

  // Detect generation mode from URL on initial render
  const urlParams = new URLSearchParams(window.location.search);
  const initialIsGenerationMode = urlParams.get('mode') === 'generate';

  // Generation mode state (set once on initial render, never changes)
  const [isGenerationMode] = useState(initialIsGenerationMode);
  const [isGenerating, setIsGenerating] = useState(initialIsGenerationMode);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const generationStartedRef = useRef(false);

  // Generation hooks
  const generateMutation = useGenerateMindmap();
  const updateMindmapMutation = useUpdateMindmap();
  const { applyAutoLayout } = useLayoutStore();

  const userPermission = mindmap?.permission;

  // Track if locale was already applied to prevent infinite loops
  const localeAppliedRef = useRef(false);

  // Apply locale from URL (from Flutter) or localStorage - run only once on mount
  useEffect(() => {
    if (localeAppliedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const urlLocale = params.get('locale');
    const savedLocale = localStorage.getItem('i18nextLng');
    const localeToApply = urlLocale || savedLocale;

    if (localeToApply && localeToApply !== i18n.language) {
      localeAppliedRef.current = true;
      i18n.changeLanguage(localeToApply);
      // Save to localStorage so it persists
      if (urlLocale) {
        localStorage.setItem('i18nextLng', urlLocale);
      }
    }
  }, [i18n]);

  /**
   * Poll localStorage for generation request from Flutter.
   * Flutter stores the request before loading the WebView.
   */
  const pollForGenerationRequest = useCallback((): Promise<MindmapMobileGenerationRequest> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max

      const poll = () => {
        const stored = localStorage.getItem('mindmapGenerationRequest');
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as MindmapMobileGenerationRequest;
            localStorage.removeItem('mindmapGenerationRequest'); // Clean up
            resolve(parsed);
          } catch (e) {
            reject(new Error('Invalid generation request format'));
          }
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 100);
        } else {
          reject(new Error('Generation request not found'));
        }
      };

      poll();
    });
  }, []);

  /**
   * Run the mindmap generation flow.
   */
  const runGeneration = useCallback(async () => {
    try {
      // Signal Flutter that we're ready to show WebView
      notifyFlutter('mindmapGenerationViewReady', {});

      // Poll for generation request from Flutter
      const request = await pollForGenerationRequest();

      // Build the API request
      const generateRequest: MindmapGenerateRequest = {
        topic: request.topic,
        model: request.model,
        provider: request.provider,
        language: request.language,
        maxDepth: request.maxDepth,
        maxBranchesPerNode: request.maxBranchesPerNode,
        grade: request.grade,
        subject: request.subject,
      };

      // Step 1: Generate AI nodes
      const aiResponse = await generateMutation.mutateAsync(generateRequest);

      // Step 2: Convert AI response to mindmap nodes/edges with layout
      const basePosition = { x: 0, y: 0 };
      const { nodes, edges } = await convertAiDataToMindMapNodes(
        aiResponse,
        basePosition,
        DEFAULT_LAYOUT_TYPE
      );

      // Step 3: Update the mindmap with generated content
      const updateData = {
        title: request.topic,
        nodes,
        edges,
      };

      await updateMindmapMutation.mutateAsync({
        id: mindmap.id,
        data: updateData,
      });

      // Step 4: Set nodes/edges in store for display
      setNodes(nodes);
      setEdges(edges);

      // Step 4.5: Apply layout to the root node after nodes are set
      const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE);
      if (rootNode) {
        setTimeout(() => {
          applyAutoLayout(rootNode.id);
        }, 300); // Delay to ensure ReactFlow has processed the new nodes
      }

      // Step 5: Signal completion to Flutter
      setIsGenerating(false);
      notifyFlutter('mindmapGenerationCompleted', {
        success: true,
        nodeCount: nodes.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      setGenerationError(errorMessage);
      setIsGenerating(false);
      notifyFlutter('mindmapGenerationCompleted', {
        success: false,
        error: errorMessage,
      });
    }
  }, [
    pollForGenerationRequest,
    generateMutation,
    updateMindmapMutation,
    mindmap.id,
    setNodes,
    setEdges,
    applyAutoLayout,
  ]);

  // Start generation when in generation mode
  useEffect(() => {
    if (isGenerationMode && !generationStartedRef.current) {
      generationStartedRef.current = true;
      runGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerationMode]); // runGeneration intentionally omitted - ref guards execution

  // Notify Flutter that the embed page is ready (view mode only)
  useEffect(() => {
    if (!isGenerationMode) {
      notifyFlutter('mobileViewReady', {});
    }
  }, [isGenerationMode]);

  // Sync mindmap data from React Router loader to stores (view mode only)
  useEffect(() => {
    // Skip if in generation mode - generation flow handles this
    if (isGenerationMode) return;

    if (mindmap) {
      // Migrate layout data from metadata to root nodes for backward compatibility
      const migratedNodes = migrateLayoutDataToRootNodes(mindmap.nodes, mindmap.metadata);

      setNodes(migratedNodes);
      setEdges(mindmap.edges);

      // Notify Flutter that mindmap is loaded (hides native loader)
      notifyFlutter('mindmapLoaded', {
        success: true,
        nodeCount: migratedNodes.length,
      });
    }
  }, [mindmap, setNodes, setEdges, isGenerationMode]);

  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  const togglePanOnDrag = () => {
    setIsPanOnDrag(!isPanOnDrag);
  };

  useCommentDrawerTrigger(() => setIsCommentDrawerOpen(true));

  // Show error state if generation failed
  if (generationError) {
    return (
      <div className="bg-background fixed inset-0 flex items-center justify-center">
        <div className="p-6 text-center">
          <div className="text-destructive mb-2 text-lg font-semibold">{t('embed.generationFailed')}</div>
          <div className="text-muted-foreground text-sm">{generationError}</div>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <MindmapPermissionProvider isPresenterMode={false} userPermission={userPermission}>
        {/* Generation loading overlay */}
        {isGenerating && (
          <div className="bg-background fixed inset-0 z-[100] flex flex-col items-center justify-center">
            <Loader2 className="text-primary mb-4 h-10 w-10 animate-spin" />
            <div className="text-lg font-medium">{t('embed.generating')}</div>
            <div className="text-muted-foreground mt-2 text-sm">{t('embed.generatingSubtitle')}</div>
          </div>
        )}

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
