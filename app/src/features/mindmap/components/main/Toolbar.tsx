import { GitBranchPlus, Undo, Redo, Save, Sparkles, Download, Share2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { useUndoRedoStore, useNodeOperationsStore } from '../../stores';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useSaveMindmap, useNodeSelection } from '../../hooks';
import { useState, useEffect } from 'react';
import ExportMindmapDialog from '../export';
import { GenerateTreeDialog } from '../generate';
import ShareMindmapDialog from '../share/ShareMindmapDialog';
import NodeSelectionTab from './NodeSelectionTab';
import LoadingButton from '@/components/common/LoadingButton';
import { cn } from '@/shared/lib/utils';
import { TreePanelContent } from '../tree-panel';
import { CommentDrawer } from '@/features/comments';
import { useDocumentPermission } from '@/shared/hooks/useDocumentPermission';
import { PermissionBadge } from '@/shared/components/common/PermissionBadge';

const Toolbar = ({ mindmapId, isMobileSheet = false }: { mindmapId: string; isMobileSheet?: boolean }) => {
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
  const addNode = useNodeOperationsStore((state) => state.addNode);
  const undo = useUndoRedoStore((state) => state.undo);
  const redo = useUndoRedoStore((state) => state.redo);
  const canUndo = useUndoRedoStore((state) => !state.undoStack.isEmpty());
  const canRedo = useUndoRedoStore((state) => !state.redoStack.isEmpty());

  // Selection state
  const { selectedCount, hasSelection } = useNodeSelection();

  // Permission state
  const { permission: userPermission, isLoading: isPermissionLoading } = useDocumentPermission(mindmapId);

  // Save and Export states
  const { saveWithThumbnail, isLoading: isSaving } = useSaveMindmap();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('general');

  // Auto-switch to general tab when selection is cleared or to selection tab when selection exists
  useEffect(() => {
    if (!hasSelection && activeTab === 'selection') {
      setActiveTab('general');
    }

    if (hasSelection && activeTab === 'general') {
      setActiveTab('selection');
    }
  }, [hasSelection, activeTab]);

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
          {userPermission && <PermissionBadge permission={userPermission} isLoading={isPermissionLoading} />}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
        <TabsList className={cn('grid w-full grid-cols-3', isMobileSheet && 'h-12')}>
          <TabsTrigger value="general" className={cn(isMobileSheet && 'text-base')}>
            {t('toolbar.tabs.general')}
          </TabsTrigger>
          <TabsTrigger
            value="selection"
            className={cn(hasSelection && 'relative', isMobileSheet && 'text-base')}
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
          <TabsTrigger value="tree" className={cn(isMobileSheet && 'text-base')}>
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
                  isMobileSheet && 'h-11 min-h-[44px] text-base'
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
                  isMobileSheet && 'h-11 min-h-[44px] text-base'
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
                  isMobileSheet && 'h-11 min-h-[44px] text-base'
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
                  isMobileSheet && 'h-11 min-h-[44px] text-base'
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
                  isMobileSheet && 'h-11 min-h-[44px] text-base'
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
                  isMobileSheet && 'h-11 min-h-[44px] text-base'
                )}
                size="sm"
              >
                <Download size={isMobileSheet ? 20 : 16} />
                {t('toolbar.export.export')}
              </Button>
              {userPermission === 'edit' && (
                <Button
                  variant="outline"
                  onClick={() => setIsShareDialogOpen(true)}
                  className={cn(
                    'w-full transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500',
                    isMobileSheet && 'h-11 min-h-[44px] text-base'
                  )}
                  size="sm"
                  title="Share this mindmap"
                >
                  <Share2 size={isMobileSheet ? 20 : 16} />
                  Share
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsCommentDrawerOpen(true)}
                className={cn(
                  'w-full transition-colors hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500',
                  isMobileSheet && 'h-11 min-h-[44px] text-base'
                )}
                size="sm"
                title="Comments"
              >
                <MessageSquare size={isMobileSheet ? 20 : 16} />
                Comments
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Selection Tab Content */}
        <TabsContent value="selection" className="mt-4 flex-1">
          <NodeSelectionTab />
        </TabsContent>

        {/* Tree Tab Content */}
        <TabsContent value="tree" className="mt-4 flex-1 overflow-hidden">
          <TreePanelContent />
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <ExportMindmapDialog isOpen={isExportDialogOpen} onOpenChange={setIsExportDialogOpen} />

      {/* Generate Tree Dialog */}
      <GenerateTreeDialog isOpen={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen} />

      {/* Share Dialog */}
      <ShareMindmapDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        mindmapId={mindmapId}
      />

      {/* Comment Drawer */}
      <CommentDrawer
        isOpen={isCommentDrawerOpen}
        onOpenChange={setIsCommentDrawerOpen}
        documentId={mindmapId}
        documentType="mindmap"
        userPermission={userPermission || 'read'}
      />
    </div>
  );
};

export default Toolbar;
