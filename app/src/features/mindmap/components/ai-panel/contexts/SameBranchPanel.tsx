import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';

import type { SameBranchContext, NodeContentItem, RefineBranchRequest } from '../../../types/aiModification';
import type { MindMapNode } from '../../../types/mindmap';
import { useBranchRefinement } from '../../../hooks/ai/useBranchRefinement';
import { useMindmapQuickActions } from '../../../hooks/ai/useMindmapQuickActions';
import { QuickActionsRow } from '../common/QuickActionsRow';
import { ChatInterface } from '../common/ChatInterface';
import { FeedbackMessage } from '../common/FeedbackMessage';

interface Props {
  context: SameBranchContext;
}

/**
 * Panel for refining multiple nodes from the same branch
 */
export function SameBranchPanel({ context }: Props): React.ReactElement {
  const { t } = useTranslation('mindmap');
  const { isProcessing, error, refineBranch, clearError } = useBranchRefinement();
  const quickActions = useMindmapQuickActions();
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Helper function to extract plain text from HTML content
  const getNodeContent = (node: MindMapNode): string => {
    const content = typeof node.data.content === 'string' ? node.data.content : '';
    // Strip HTML tags
    return content.replace(/<[^>]*>/g, '').trim();
  };

  // Helper function to build API request
  const buildRequest = (instruction: string, operation?: string): RefineBranchRequest => {
    const nodes: NodeContentItem[] = context.nodes.map((node) => ({
      nodeId: node.id,
      content: getNodeContent(node),
      level: node.data.level || 0,
    }));

    return {
      nodes,
      instruction,
      operation,
      context: {
        currentLevel: context.level,
        parentContent: context.parentContent,
      },
    };
  };

  const handleQuickAction = async (operation: string, instruction: string) => {
    try {
      clearError();
      setFeedbackMessage(null);

      const request = buildRequest(instruction, operation);
      await refineBranch(request);

      const successMsg = t(
        'aiPanel.feedback.branchSuccess',
        `${context.nodeCount} nodes refined successfully`
      );
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

      const successMsg = t(
        'aiPanel.feedback.branchSuccess',
        `${context.nodeCount} nodes refined successfully`
      );
      setFeedbackMessage({ type: 'success', text: String(successMsg) });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refine branch';
      setFeedbackMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header Section */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          {t('aiPanel.sameBranch.title', 'Branch Operations')}
        </label>
        {context.parentContent && (
          <div className="mt-1 text-xs text-gray-500">
            {t('aiPanel.sameBranch.parent', 'Parent')}: {context.parentContent}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {t(
            'aiPanel.sameBranch.description',
            'AI will refine all concepts while maintaining coherence across the branch'
          )}
        </p>
      </div>

      {/* Nodes Display Section */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          {t('aiPanel.sameBranch.selected', 'Selected Concepts')}
        </label>
        {context.nodeCount <= 5 ? (
          // Show all nodes
          <div className="mt-2 space-y-1">
            {context.nodes.map((node) => (
              <div key={node.id} className="rounded bg-gray-50 p-2 text-sm text-gray-700">
                • {getNodeContent(node)}
              </div>
            ))}
          </div>
        ) : (
          // Show count only
          <div className="mt-2 rounded bg-gray-50 p-2 text-sm text-gray-600">
            {context.nodeCount} {t('aiPanel.sameBranch.concepts', 'concepts selected')}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <QuickActionsRow actions={quickActions} onActionClick={handleQuickAction} isLoading={isProcessing} />

      {/* Separator */}
      <Separator />

      {/* Chat Interface for Custom Instructions */}
      <ChatInterface
        placeholder={String(
          t('aiPanel.sameBranch.chatPlaceholder', `Ask AI to refine these ${context.nodeCount} nodes...`)
        )}
        onSubmit={handleCustomInstruction}
        isLoading={isProcessing}
      />

      {/* Feedback Messages */}
      {feedbackMessage && <FeedbackMessage type={feedbackMessage.type} message={feedbackMessage.text} />}

      {error && <FeedbackMessage type="error" message={error} />}
    </div>
  );
}
