import LoadingButton from '@/components/common/LoadingButton';
import { Button } from '@/components/ui/button';
import { CommentDrawer } from '@/features/comments';
import { PermissionBadge } from '@/shared/components/common/PermissionBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { cn } from '@/shared/lib/utils';
import type { Permission } from '@/shared/utils/permission';
import { Copy, Download, GitBranchPlus, Redo, Save, Share2, Sparkles, Undo } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSaveMindmap } from '../../hooks';
import { useDuplicateMindmap } from '../../hooks/useApi';
import { useCoreStore, useNodeOperationsStore, useUndoRedoStore } from '../../stores';
import { useSavingStore } from '../../stores/saving';
import AIMindmapPanel from '../ai-panel/AIMindmapPanel';
import ExportMindmapDialog from '../export';
import { GenerateTreeDialog } from '../generate';
import ShareMindmapDialog from '../share/ShareMindmapDialog';
import { TreePanelContent } from '../tree-panel';
import NodeSelectionTab from './NodeSelectionTab';

// Memoized dialogs component to prevent re-renders when Toolbar state changes
const ToolbarDialogs = memo(
  ({
    mindmapId,
    isExportDialogOpen,
    onExportDialogOpenChange,
    isGenerateDialogOpen,
    onGenerateDialogOpenChange,
    isShareDialogOpen,
    onShareDialogOpenChange,
    isCommentDrawerOpen,
    onCommentDrawerOpenChange,
    permission,
  }: {
    mindmapId: string;
    isExportDialogOpen: boolean;
    onExportDialogOpenChange: (open: boolean) => void;
    isGenerateDialogOpen: boolean;
    onGenerateDialogOpenChange: (open: boolean) => void;
    isShareDialogOpen: boolean;
    onShareDialogOpenChange: (open: boolean) => void;
    isCommentDrawerOpen: boolean;
    onCommentDrawerOpenChange: (open: boolean) => void;
    permission?: Permission;
  }) => (
    <>
      <ExportMindmapDialog isOpen={isExportDialogOpen} onOpenChange={onExportDialogOpenChange} />
      <GenerateTreeDialog isOpen={isGenerateDialogOpen} onOpenChange={onGenerateDialogOpenChange} />
      <ShareMindmapDialog
        isOpen={isShareDialogOpen}
        onOpenChange={onShareDialogOpenChange}
        mindmapId={mindmapId}
      />
      <CommentDrawer
        isOpen={isCommentDrawerOpen}
        onOpenChange={onCommentDrawerOpenChange}
        documentId={mindmapId}
        documentType="mindmap"
        userPermission={permission || 'read'}
      />
    </>
  )
);

ToolbarDialogs.displayName = 'ToolbarDialogs';

const Toolbar = memo(
  ({
    mindmapId,
    isMobileSheet = false,
    permission,
  }: {
    mindmapId: string;
    isMobileSheet?: boolean;
    permission?: Permission;
  }) => {
    const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
    const navigate = useNavigate();
    const addNode = useNodeOperationsStore((state) => state.addNode);
    const undo = useUndoRedoStore((state) => state.undo);
    const redo = useUndoRedoStore((state) => state.redo);
    const canUndo = useUndoRedoStore((state) => !state.undoStack.isEmpty());
    const canRedo = useUndoRedoStore((state) => !state.redoStack.isEmpty());

    // Selection state
    // Selection state - usage of useNodeSelection hook causes re-renders on every node change (e.g. drag)
    // because it returns a new array of selected nodes.
    // We only need the count and existence here.
    const selectedCount = useCoreStore((state) => state.selectedNodeIds.size);
    const hasSelection = selectedCount > 0;

    // Permission state
    const userPermission = permission;

    // Save and Export states
    const { saveWithThumbnail, isLoading: isSaving } = useSaveMindmap();
    const duplicateMutation = useDuplicateMindmap();
    const setIsDuplicating = useSavingStore((state) => state.setIsDuplicating);

    // Handle duplicate with navigation
    const handleDuplicate = useCallback(async () => {
      setIsDuplicating(true);
      try {
        const duplicated = await duplicateMutation.mutateAsync(mindmapId);
        navigate(`/mindmap/${duplicated.id}`);
      } catch (error) {
        console.error('Duplicate failed:', error);
      } finally {
        setIsDuplicating(false);
      }
    }, [mindmapId, duplicateMutation, navigate, setIsDuplicating]);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('general');

    return (
      <div
        className={cn(
          'flex flex-col gap-2 p-4',
          isMobileSheet
            ? 'w-full bg-transparent'
            : 'w-[400px] overflow-x-hidden border-l border-gray-200 bg-gradient-to-b from-white to-slate-50/95 shadow-lg backdrop-blur-md'
        )}
      >
        {/* Header - Hide on mobile (shown in SheetHeader instead) */}
        {!isMobileSheet && (
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">{t('toolbar.title')}</h2>
            {userPermission && <PermissionBadge permission={userPermission} />}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
          <TabsList className={cn('grid w-full grid-cols-4', isMobileSheet ? 'h-12' : 'h-10')}>
            <TabsTrigger value="general" className={cn(isMobileSheet ? 'text-base' : 'text-sm')}>
              {t('toolbar.tabs.general')}
            </TabsTrigger>
            <TabsTrigger
              value="selection"
              className={cn(hasSelection && 'relative', isMobileSheet ? 'text-base' : 'text-sm')}
            >
              {t('toolbar.tabs.selection')}
              {hasSelection && (
                <span
                  className={cn(
                    'ml-1 inline-flex items-center justify-center rounded-full bg-blue-500 text-white',
                    isMobileSheet ? 'h-6 w-6 text-sm' : 'h-5 w-5 text-xs'
                  )}
                >
                  {selectedCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ai" className={cn(isMobileSheet ? 'text-base' : 'text-sm')}>
              {t('toolbar.tabs.ai', 'AI')}
            </TabsTrigger>
            <TabsTrigger value="tree" className={cn(isMobileSheet ? 'text-base' : 'text-sm')}>
              {t('toolbar.tabs.tree')}
            </TabsTrigger>
          </TabsList>

          {/* General Tab Content */}
          <TabsContent value="general" className="mt-4 flex-1 space-y-4">
            {/* Node Operations Section */}
            <div className="space-y-2">
              <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
                {t('toolbar.sections.nodeOperations')}
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    addNode();
                  }}
                  title={t('toolbar.tooltips.addTree')}
                  variant="default"
                  size="sm"
                  className={cn(
                    'w-full transition-colors hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
                    isMobileSheet ? 'h-11 min-h-[44px] text-base' : 'h-9 text-sm'
                  )}
                >
                  <GitBranchPlus size={isMobileSheet ? 20 : 16} />
                  {t('toolbar.actions.addTree')}
                </Button>
                <Button
                  onClick={() => setIsGenerateDialogOpen(true)}
                  title={t('toolbar.tooltips.generateTree')}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'w-full gap-2 transition-colors hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500',
                    isMobileSheet ? 'h-11 min-h-[44px] text-base' : 'h-9 text-sm'
                  )}
                >
                  <Sparkles size={isMobileSheet ? 20 : 16} />
                  {t('toolbar.actions.generateTree')}
                </Button>
              </div>
            </div>

            {/* History Section */}
            <div className="space-y-2">
              <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
                {t('toolbar.sections.history')}
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={undo}
                  disabled={!canUndo}
                  title={t('toolbar.tooltips.undo')}
                  size="sm"
                  className={cn(
                    'w-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50',
                    isMobileSheet ? 'h-11 min-h-[44px] text-base' : 'h-9 text-sm'
                  )}
                >
                  <Undo size={isMobileSheet ? 20 : 16} />
                  {t('toolbar.actions.undo')}
                </Button>
                <Button
                  variant="outline"
                  onClick={redo}
                  disabled={!canRedo}
                  title={t('toolbar.tooltips.redo')}
                  size="sm"
                  className={cn(
                    'w-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50',
                    isMobileSheet ? 'h-11 min-h-[44px] text-base' : 'h-9 text-sm'
                  )}
                >
                  <Redo size={isMobileSheet ? 20 : 16} />
                  {t('toolbar.actions.redo')}
                </Button>
              </div>
            </div>

            {/* Utilities Section */}
            <div className="space-y-2">
              <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
                {t('toolbar.sections.utilities')}
              </h3>
              <div className="space-y-2">
                <LoadingButton
                  variant="outline"
                  onClick={async () => await saveWithThumbnail(mindmapId)}
                  loading={isSaving}
                  loadingText={t('toolbar.save.saving')}
                  className={cn(
                    'w-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500',
                    isMobileSheet ? 'h-11 min-h-[44px] text-base' : 'h-9 text-sm'
                  )}
                  title={t('toolbar.tooltips.saveMindmap')}
                  size="sm"
                >
                  <Save size={isMobileSheet ? 20 : 16} />
                  {t('toolbar.save.save')}
                </LoadingButton>
                <Button
                  variant="outline"
                  onClick={() => setIsExportDialogOpen(true)}
                  className={cn(
                    'w-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500',
                    isMobileSheet ? 'h-11 min-h-[44px] text-base' : 'h-9 text-sm'
                  )}
                  size="sm"
                >
                  <Download size={isMobileSheet ? 20 : 16} />
                  {t('toolbar.export.export')}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={duplicateMutation.isPending}
                      className={cn(
                        'w-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50',
                        isMobileSheet ? 'h-11 min-h-[44px] text-base' : 'h-9 text-sm'
                      )}
                      size="sm"
                      title={t('toolbar.actions.duplicate')}
                    >
                      <Copy size={isMobileSheet ? 20 : 16} />
                      {duplicateMutation.isPending
                        ? t('toolbar.save.saving')
                        : t('toolbar.actions.duplicate')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('toolbar.actions.duplicate')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('toolbar.actions.duplicateConfirm')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('toolbar.actions.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDuplicate}>
                        {t('toolbar.actions.confirm')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {userPermission === 'edit' && (
                  <Button
                    variant="outline"
                    onClick={() => setIsShareDialogOpen(true)}
                    className={cn(
                      'w-full transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500',
                      isMobileSheet ? 'h-11 min-h-[44px] text-base' : 'h-9 text-sm'
                    )}
                    size="sm"
                    title={t('toolbar.tooltips.share')}
                  >
                    <Share2 size={isMobileSheet ? 20 : 16} />
                    {t('toolbar.actions.share')}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Selection Tab Content */}
          <TabsContent value="selection" className="mt-4 flex-1">
            <NodeSelectionTab />
          </TabsContent>

          {/* AI Tab Content */}
          <TabsContent value="ai" className="mt-4 flex-1 overflow-hidden">
            <AIMindmapPanel mindmapId={mindmapId} />
          </TabsContent>

          {/* Tree Tab Content */}
          <TabsContent value="tree" className="mt-4 flex-1 overflow-hidden">
            <TreePanelContent />
          </TabsContent>
        </Tabs>

        {/* Dialogs and Drawers */}
        <ToolbarDialogs
          mindmapId={mindmapId}
          isExportDialogOpen={isExportDialogOpen}
          onExportDialogOpenChange={setIsExportDialogOpen}
          isGenerateDialogOpen={isGenerateDialogOpen}
          onGenerateDialogOpenChange={setIsGenerateDialogOpen}
          isShareDialogOpen={isShareDialogOpen}
          onShareDialogOpenChange={setIsShareDialogOpen}
          isCommentDrawerOpen={isCommentDrawerOpen}
          onCommentDrawerOpenChange={setIsCommentDrawerOpen}
          permission={userPermission}
        />
      </div>
    );
  }
);

Toolbar.displayName = 'Toolbar';

export default Toolbar;
