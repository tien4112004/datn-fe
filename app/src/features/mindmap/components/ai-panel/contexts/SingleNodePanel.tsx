import { Button } from '@ui/button';
import { Label } from '@ui/label';
import { Separator } from '@ui/separator';
import DOMPurify from 'dompurify';
import { TreeDeciduous } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMindmapQuickActions } from '@/features/mindmap/hooks/ai/useMindmapQuickActions';
import { useNodeExpansion } from '@/features/mindmap/hooks/ai/useNodeExpansion';
import { useNodeRefinement } from '@/features/mindmap/hooks/ai/useNodeRefinement';
import type { MindmapMetadataResponse } from '@/features/mindmap/types';
import type { SingleNodeContext } from '@/features/mindmap/types/aiModification';
import { MODEL_TYPES, useModels } from '@/features/model';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { ChatInterface } from '../common/ChatInterface';
import { FeedbackMessage } from '../common/FeedbackMessage';
import { QuickActionsRow } from '../common/QuickActionsRow';
import { ExpandNodeDialog } from '../dialogs/ExpandNodeDialog';

interface Props {
  context: SingleNodeContext;
  metadata?: MindmapMetadataResponse;
  isMetadataLoading?: boolean;
}

/**
 * Panel for refining a single selected node
 */
export function SingleNodePanel({ context, metadata }: Props): React.ReactElement {
  const { t } = useTranslation('mindmap');
  const { isProcessing, error, refineNode, clearError } = useNodeRefinement(metadata);
  const { isExpanding, expandNode } = useNodeExpansion(metadata);
  const quickActions = useMindmapQuickActions();
  const { models = [], isLoading: isModelsLoading, isError: isModelsError } = useModels(MODEL_TYPES.TEXT);

  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [isExpandDialogOpen, setIsExpandDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => models.find((m: any) => m.default) || models[0]);

  const nodeContent = typeof context.node.data.content === 'string' ? context.node.data.content : '';

  const handleQuickAction = async (operation: string, instruction: string) => {
    try {
      clearError();
      setFeedbackMessage(null);
      await refineNode({
        nodeId: context.node.id,
        currentContent: nodeContent,
        instruction,
        operation,
        model: selectedModel?.name,
        provider: selectedModel?.provider,
      });
      const successMsg = t('aiPanel.feedback.success');
      setFeedbackMessage({ type: 'success', text: String(successMsg) });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refine node';
      setFeedbackMessage({ type: 'error', text: errorMsg });
    }
  };

  const handleCustomInstruction = async (instruction: string) => {
    if (!instruction.trim()) return;

    try {
      clearError();
      setFeedbackMessage(null);
      await refineNode({
        nodeId: context.node.id,
        currentContent: nodeContent,
        instruction,
        model: selectedModel?.name,
        provider: selectedModel?.provider,
      });
      const successMsg = t('aiPanel.feedback.success');
      setFeedbackMessage({ type: 'success', text: String(successMsg) });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refine node';
      setFeedbackMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Node content display */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          {t('aiPanel.current')}
        </label>
        <div
          className="prose prose-sm mt-1 max-w-none rounded bg-gray-50 p-2 text-sm text-gray-700"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(nodeContent) }}
        />
      </div>

      {/* Quick actions */}
      <QuickActionsRow actions={quickActions} onActionClick={handleQuickAction} isLoading={isProcessing} />

      {/* Model Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t('expandNode.model')}</Label>
        <ModelSelect
          models={models}
          value={selectedModel}
          onValueChange={(model) => setSelectedModel(model as any)}
          disabled={isProcessing || isModelsLoading}
          isLoading={isModelsLoading}
          isError={isModelsError}
        />
        <p className="text-xs text-gray-500">{t('expandNode.model.hint')}</p>
      </div>

      {/* Separator */}
      <Separator />

      {/* Chat interface for custom instructions */}
      <ChatInterface
        placeholder={String(t('aiPanel.chat.placeholder'))}
        onSubmit={handleCustomInstruction}
        isLoading={isProcessing}
      />

      {/* Expand Tree Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          {t('aiPanel.expandTree.title')}
        </label>
        <p className="text-xs text-gray-500">{t('aiPanel.expandTree.description')}</p>
        <Button
          onClick={() => setIsExpandDialogOpen(true)}
          disabled={isExpanding || isProcessing}
          variant="outline"
          className="w-full"
        >
          <TreeDeciduous className="mr-2 h-4 w-4" />
          {t('aiPanel.expandTree.button')}
        </Button>
      </div>

      {/* Feedback message */}
      {feedbackMessage && <FeedbackMessage type={feedbackMessage.type} message={feedbackMessage.text} />}

      {error && <FeedbackMessage type="error" message={error} />}

      {/* Expand Node Dialog */}
      <ExpandNodeDialog
        isOpen={isExpandDialogOpen}
        onOpenChange={setIsExpandDialogOpen}
        context={context}
        onExpand={expandNode}
        isExpanding={isExpanding}
      />
    </div>
  );
}
