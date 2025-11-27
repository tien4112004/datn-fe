import { Plus, Undo, Redo, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { useUndoRedoStore, useCoreStore, useNodeOperationsStore } from '../../stores';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useSaveMindmap } from '../../hooks/useSaveMindmap';
import { useNodeSelection } from '../../hooks/useNodeSelection';
import { useState, useEffect } from 'react';
import ExportMindmapDialog from '../export';
import NodeSelectionTab from './NodeSelectionTab';
import LoadingButton from '@/components/common/LoadingButton';
import { cn } from '@/shared/lib/utils';

const Toolbar = ({ mindmapId }: { mindmapId: string }) => {
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
  const addNode = useNodeOperationsStore((state) => state.addNode);
  const logData = useCoreStore((state) => state.logData);
  const undo = useUndoRedoStore((state) => state.undo);
  const redo = useUndoRedoStore((state) => state.redo);
  const canUndo = useUndoRedoStore((state) => !state.undoStack.isEmpty());
  const canRedo = useUndoRedoStore((state) => !state.redoStack.isEmpty());

  // Selection state
  const { selectedCount, hasSelection } = useNodeSelection();

  // Save and Export states
  const { saveWithThumbnail, isLoading: isSaving } = useSaveMindmap();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('general');

  // Auto-switch to general tab when selection is cleared
  useEffect(() => {
    if (!hasSelection && activeTab === 'selection') {
      setActiveTab('general');
    }
  }, [hasSelection, activeTab]);

  return (
    <div className="absolute bottom-0 right-0 top-0 z-10 flex w-64 flex-col gap-2 overflow-y-auto border-l border-gray-200 bg-gradient-to-b from-white to-slate-50/95 p-4 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">{t('toolbar.title')}</h2>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">{t('toolbar.tabs.general')}</TabsTrigger>
          <TabsTrigger value="selection" className={cn(hasSelection && 'relative')}>
            {t('toolbar.tabs.selection')}
            {hasSelection && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                {selectedCount}
              </span>
            )}
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
                title={t('toolbar.tooltips.addNode')}
                variant="default"
                size="sm"
                className="w-full transition-colors hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus size={16} />
                {t('toolbar.actions.addNode')}
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
                className="w-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                <Undo size={16} />
                {t('toolbar.actions.undo')}
              </Button>
              <Button
                variant="outline"
                onClick={redo}
                disabled={!canRedo}
                title={t('toolbar.tooltips.redo')}
                size="sm"
                className="w-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                <Redo size={16} />
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
              <Button
                variant="outline"
                onClick={logData}
                size="sm"
                title={t('toolbar.tooltips.logData')}
                className="w-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <span className="sr-only">{t('toolbar.actions.logData')}</span>
                {t('toolbar.actions.logData')}
              </Button>
              <LoadingButton
                variant="outline"
                onClick={async () => await saveWithThumbnail(mindmapId)}
                loading={isSaving}
                loadingText={t('toolbar.save.saving')}
                className="w-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                title={t('toolbar.tooltips.saveMindmap')}
                size="sm"
              >
                <Save size={16} />
                {t('toolbar.save.save')}
              </LoadingButton>
              <Button
                variant="outline"
                onClick={() => setIsExportDialogOpen(true)}
                className="w-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                size="sm"
              >
                Export
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Selection Tab Content */}
        <TabsContent value="selection" className="mt-4 flex-1">
          <NodeSelectionTab />
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <ExportMindmapDialog isOpen={isExportDialogOpen} onOpenChange={setIsExportDialogOpen} />
    </div>
  );
};

export default Toolbar;
