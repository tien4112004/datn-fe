import { Label } from '@ui/label';
import { ScrollArea } from '@ui/scroll-area';
import { Separator } from '@ui/separator';
import DOMPurify from 'dompurify';
import { GitFork, Layers, MessageSquare } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MODEL_TYPES, useModels } from '@/features/model';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { useBranchRefinement } from '../../../hooks/ai/useBranchRefinement';
import { useMindmapQuickActions } from '../../../hooks/ai/useMindmapQuickActions';
import type { MindmapMetadataResponse } from '../../../types';
import type { NodeContentItem, RefineBranchRequest, SameBranchContext } from '../../../types/aiModification';
import { ChatInterface } from '../common/ChatInterface';
import { FeedbackMessage } from '../common/FeedbackMessage';
import { QuickActionsRow } from '../common/QuickActionsRow';

interface Props {
  context: SameBranchContext;
  metadata?: MindmapMetadataResponse;
  isMetadataLoading?: boolean;
}

/**
 * Panel for refining multiple nodes from the same branch
 */
export function SameBranchPanel({ context, metadata }: Props): React.ReactElement {
  const { t } = useTranslation('mindmap');
  const { isProcessing, error, refineBranch, clearError } = useBranchRefinement(metadata);
  const quickActions = useMindmapQuickActions();
  const { models = [], isLoading: isModelsLoading, isError: isModelsError } = useModels(MODEL_TYPES.TEXT);

  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [selectedModel, setSelectedModel] = useState(() => models.find((m: any) => m.default) || models[0]);

  // Helper function to build API request
  const buildRequest = (instruction: string, operation?: string): RefineBranchRequest => {
    const nodes: NodeContentItem[] = context.nodes.map((node) => ({
      nodeId: node.id,
      content: typeof node.data.content === 'string' ? node.data.content : '',
      level: node.data.level || 0,
    }));

    return {
      nodes,
      instruction,
      operation,
      context: {
        mindmapId: metadata?.mindmapId,
        rootNodeId: metadata?.rootNodeId,
        currentLevel: context.level,
        parentContent: context.parentContent,
        mindmapTitle: metadata?.title,
        rootNodeContent: context.ancestryPath.length > 0 ? context.ancestryPath[0] : undefined,
        fullAncestryPath: context.ancestryPath,
      },
      model: selectedModel?.name,
      provider: selectedModel?.provider,
    };
  };

  const handleQuickAction = async (operation: string, instruction: string) => {
    try {
      clearError();
      setFeedbackMessage(null);

      const request = buildRequest(instruction, operation);
      await refineBranch(request);

      const successMsg = t('aiPanel.feedback.branchSuccess');
      setFeedbackMessage({ type: 'success', text: String(successMsg) });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refine branch';
      setFeedbackMessage({ type: 'error', text: errorMsg });
    }
  };

  const handleCustomInstruction = async (instruction: string) => {
    if (!instruction.trim()) return;

    try {
      clearError();
      setFeedbackMessage(null);

      const request = buildRequest(instruction);
      await refineBranch(request);

      const successMsg = t('aiPanel.feedback.branchSuccess');
      setFeedbackMessage({ type: 'success', text: String(successMsg) });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refine branch';
      setFeedbackMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="space-y-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Layers className="h-4 w-4 text-purple-600" />
          {t('aiPanel.sameBranch.title')}
        </h3>
        <p className="text-xs text-gray-500">{t('aiPanel.sameBranch.description')}</p>
      </div>

      {/* Context */}
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 shadow-sm">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <GitFork className="h-3 w-3" />
          {t('aiPanel.sameBranch.parent')}
        </div>
        {context.parentContent ? (
          <div
            className="prose prose-sm line-clamp-2 max-w-none text-sm text-gray-700"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(context.parentContent),
            }}
          />
        ) : (
          <span className="text-sm italic text-gray-400">Root node</span>
        )}
      </div>

      {/* Selected Nodes List */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {t('aiPanel.sameBranch.selected')} ({context.nodeCount})
        </label>

        <ScrollArea className="h-[120px] rounded-md border border-gray-200 bg-white">
          <div className="space-y-1 p-2">
            {context.nodes.slice(0, 10).map((node) => (
              <div
                key={node.id}
                className="bg-muted-background rounded-sm border border-gray-100 px-2 text-sm text-gray-700"
              >
                <div
                  className="prose prose-sm line-clamp-1 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      typeof node.data.content === 'string' ? node.data.content : ''
                    ),
                  }}
                />
              </div>
            ))}
            {context.nodeCount > 10 && (
              <div className="py-1 text-center text-xs italic text-gray-400">
                + {context.nodeCount - 10} more items...
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Quick Actions */}
      <QuickActionsRow actions={quickActions} onActionClick={handleQuickAction} isLoading={isProcessing} />

      {/* Model Selection */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {t('expandNode.model')}
        </Label>
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

      {/* Chat Interface */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <MessageSquare className="h-3 w-3" />
          {t('aiPanel.chat.label', 'Custom Instruction')}
        </label>
        <ChatInterface
          placeholder={String(t('aiPanel.sameBranch.chatPlaceholder'))}
          onSubmit={handleCustomInstruction}
          isLoading={isProcessing}
        />
      </div>

      {/* Feedback Messages */}
      <div className="space-y-2">
        {feedbackMessage && <FeedbackMessage type={feedbackMessage.type} message={feedbackMessage.text} />}
        {error && <FeedbackMessage type="error" message={error} />}
      </div>
    </div>
  );
}
