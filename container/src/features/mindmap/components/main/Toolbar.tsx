import { Plus, Trash2, Undo, Redo, ChevronDown, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';
import { useLayoutStore } from '../../stores/layout';
import { useUndoRedoStore, useCoreStore, useNodeOperationsStore } from '../../stores';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useSaveMindmap } from '../../hooks/useSaveMindmap';
import { useState } from 'react';
import ExportMindmapDialog from '../export';
import type { Direction } from '../../types';
import LoadingButton from '@/components/common/LoadingButton';

const Toolbar = ({ mindmapId }: { mindmapId: string }) => {
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
  const addNode = useNodeOperationsStore((state) => state.addNode);
  const deleteSelectedNodes = useNodeOperationsStore((state) => state.markNodeForDeletion);
  const logData = useCoreStore((state) => state.logData);
  const undo = useUndoRedoStore((state) => state.undo);
  const redo = useUndoRedoStore((state) => state.redo);
  const canUndo = useUndoRedoStore((state) => !state.undoStack.isEmpty());
  const canRedo = useUndoRedoStore((state) => !state.redoStack.isEmpty());

  const layout = useLayoutStore((state) => state.layout);
  const setLayout = useLayoutStore((state) => state.setLayout);
  const isAutoLayoutEnabled = useLayoutStore((state) => state.isAutoLayoutEnabled);
  const setAutoLayoutEnabled = useLayoutStore((state) => state.setAutoLayoutEnabled);
  const updateNodeDirection = useLayoutStore((state) => state.updateNodeDirection);
  const applyAutoLayout = useLayoutStore((state) => state.applyAutoLayout);

  // Save and Export states
  const { saveWithThumbnail, isLoading: isSaving } = useSaveMindmap();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const handleDirectionChange = (value: Direction) => {
    setLayout(value);

    if (isAutoLayoutEnabled) {
      // When auto-layout is enabled, direction changes should also reposition nodes
      const { updateLayout } = useLayoutStore.getState();
      updateLayout(value);
    } else {
      // When auto-layout is disabled, only update handles/controls
      updateNodeDirection(value);
    }
  };

  const handleAutoLayoutChange = (checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
      setAutoLayoutEnabled(checked);
      // If auto-layout is enabled, apply layout immediately
      if (checked) {
        applyAutoLayout();
      }
    }
  };

  return (
    <div className="absolute bottom-4 right-4 top-4 z-10 flex w-64 flex-col gap-4 overflow-y-auto rounded-xl border border-gray-300 bg-gradient-to-b from-white to-slate-50/95 p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">{t('toolbar.title')}</h2>
      </div>

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
          <Button
            onClick={deleteSelectedNodes}
            title={t('toolbar.tooltips.deleteSelected')}
            variant="destructive"
            size="sm"
            className="w-full transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <Trash2 size={16} />
            {t('toolbar.actions.deleteSelected')}
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

      {/* Layout Section */}
      <div className="space-y-3">
        <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
          {t('toolbar.sections.layout')}
        </h3>

        {/* Force Auto Layout Checkbox */}
        <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
          <Checkbox
            id="auto-layout"
            checked={isAutoLayoutEnabled}
            onCheckedChange={handleAutoLayoutChange}
            className="mt-0.5"
          />
          <Label htmlFor="auto-layout" className="flex-1 cursor-pointer text-sm font-medium text-gray-700">
            {t('toolbar.layout.forceAutoLayout')}
          </Label>
        </div>

        {/* Direction Dropdown */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-600">{t('toolbar.layout.direction')}</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {layout === 'horizontal' && t('toolbar.layout.horizontal')}
                {layout === 'vertical' && t('toolbar.layout.vertical')}
                {layout === '' && t('toolbar.layout.none')}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => handleDirectionChange('horizontal')}>
                {t('toolbar.layout.horizontal')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDirectionChange('vertical')}>
                {t('toolbar.layout.vertical')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Manual Layout Button */}
        <Button
          variant="outline"
          onClick={() => applyAutoLayout()}
          size="sm"
          title={t('toolbar.tooltips.applyLayout')}
          className="w-full transition-colors hover:bg-gray-100"
        >
          {t('toolbar.actions.applyLayout')}
        </Button>
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

      {/* Export Dialog */}
      <ExportMindmapDialog isOpen={isExportDialogOpen} onOpenChange={setIsExportDialogOpen} />
    </div>
  );
};

export default Toolbar;
