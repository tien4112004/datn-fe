import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { TreeDeciduous } from 'lucide-react';

import type { SingleNodeContext } from '../../../types/aiModification';
import { useNodeRefinement } from '../../../hooks/ai/useNodeRefinement';
import { useNodeExpansion } from '../../../hooks/ai/useNodeExpansion';
import { useMindmapQuickActions } from '../../../hooks/ai/useMindmapQuickActions';
import { QuickActionsRow } from '../common/QuickActionsRow';
import { ChatInterface } from '../common/ChatInterface';
import { FeedbackMessage } from '../common/FeedbackMessage';
import { ExpandNodeDialog } from '../dialogs/ExpandNodeDialog';

interface Props {
  context: SingleNodeContext;
}

/**
 * Panel for refining a single selected node
 */
export function SingleNodePanel({ context }: Props): React.ReactElement {
  const { t } = useTranslation('mindmap');
  const { isProcessing, error, refineNode, clearError } = useNodeRefinement();
  const { isExpanding, expandNode } = useNodeExpansion();
  const quickActions = useMindmapQuickActions();
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [isExpandDialogOpen, setIsExpandDialogOpen] = useState(false);

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
        context: {
          currentLevel: context.level,
          parentContent: context.parentContent,
          siblingContents: context.siblingContents,
        },
      });
      const successMsg = t('aiPanel.feedback.success', 'Node refined successfully');
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
        context: {
          currentLevel: context.level,
          parentContent: context.parentContent,
          siblingContents: context.siblingContents,
        },
      });
      const successMsg = t('aiPanel.feedback.success', 'Node refined successfully');
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
          {t('aiPanel.current', 'Current Node')}
        </label>
        <div className="mt-1 rounded bg-gray-50 p-2 text-sm text-gray-700">{nodeContent}</div>
      </div>

      {/* Quick actions */}
      <QuickActionsRow actions={quickActions} onActionClick={handleQuickAction} isLoading={isProcessing} />

      {/* Separator */}
      <Separator />

      {/* Expand Tree Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          {t('aiPanel.expandTree.title', 'Generate Subtree')}
        </label>
        <p className="text-xs text-gray-500">
          {t('aiPanel.expandTree.description', 'Generate child nodes based on this concept')}
        </p>
        <Button
          onClick={() => setIsExpandDialogOpen(true)}
          disabled={isExpanding || isProcessing}
          variant="outline"
          className="w-full"
        >
          <TreeDeciduous className="mr-2 h-4 w-4" />
          {t('aiPanel.expandTree.button', 'Expand Tree')}
        </Button>
      </div>

      {/* Chat interface for custom instructions */}
      <ChatInterface
        placeholder={String(t('aiPanel.chat.placeholder', 'Ask AI to modify this node...'))}
        onSubmit={handleCustomInstruction}
        isLoading={isProcessing}
      />

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
