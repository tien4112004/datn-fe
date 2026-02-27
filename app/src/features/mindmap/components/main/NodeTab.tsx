import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@ui/accordion';
import { Palette, Sparkles } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useCoreStore } from '../../stores';
import AIMindmapPanel from '../ai-panel/AIMindmapPanel';
import NodeSelectionTab from './NodeSelectionTab';

interface NodeTabProps {
  mindmapId: string;
}

// Stable selector – reads only the size int, not the Set itself,
// so this component only re-renders when selection is gained or lost.
const selectHasSelection = (state: any) => state.selectedNodeIds.size > 0;

/**
 * Combined "Node" tab that houses both the Properties (NodeSelectionTab)
 * and AI Tools (AIMindmapPanel) panels inside collapsible accordions.
 *
 * When nothing is selected a single unified empty state is shown,
 * avoiding two separate "no selection" messages.
 */
const NodeTab = memo(({ mindmapId }: NodeTabProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
  const hasSelection = useCoreStore(selectHasSelection);

  if (!hasSelection) {
    return (
      <div className="flex flex-col items-center gap-6 px-2 py-8 text-center">
        {/* Properties hint */}
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-gray-100 p-3">
            <Palette className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{t('toolbar.selection.noSelection')}</p>
            <p className="mt-0.5 text-xs text-gray-400">{t('toolbar.selection.selectNodeHint')}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex w-full items-center gap-3">
          <div className="flex-1 border-t border-dashed border-gray-200" />
          <Sparkles className="h-3 w-3 shrink-0 text-gray-300" />
          <div className="flex-1 border-t border-dashed border-gray-200" />
        </div>

        {/* AI hint */}
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-purple-100 p-3">
            <Sparkles className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{t('aiPanel.noSelection.title')}</p>
            <p className="mt-0.5 text-xs text-gray-400">{t('aiPanel.noSelection.hint')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={['properties', 'ai']} className="w-full space-y-2">
      {/* Properties accordion */}
      <AccordionItem value="properties" className="rounded-md border border-gray-200 px-1">
        <AccordionTrigger className="rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:no-underline">
          {t('toolbar.sections.nodeProperties')}
        </AccordionTrigger>
        <AccordionContent className="px-1 pb-2">
          <NodeSelectionTab />
        </AccordionContent>
      </AccordionItem>

      {/* AI Tools accordion */}
      <AccordionItem value="ai" className="rounded-md border border-purple-200 px-1">
        <AccordionTrigger className="rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-purple-700 hover:bg-purple-50 hover:no-underline">
          {t('toolbar.sections.nodeAI')}
        </AccordionTrigger>
        <AccordionContent className="px-1 pb-2">
          <AIMindmapPanel mindmapId={mindmapId} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});

NodeTab.displayName = 'NodeTab';

export default NodeTab;
