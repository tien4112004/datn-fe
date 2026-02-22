import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { Badge } from '@ui/badge';
import { VIEW_MODE } from '@aiprimary/core';
import type { Question } from '@aiprimary/core';
import { ContextGroupView } from '../../context/ContextGroupView';
import { groupQuestionsByContext, getQuestionDisplayNumber } from '../../../utils/questionGrouping';
import { useAssignmentEditorStore } from '../../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../../stores/useAssignmentFormStore';
import type { AssignmentContext } from '../../../types';

export const ContextGroupPanel = () => {
  const { t: tContext } = useTranslation('assignment', { keyPrefix: 'context' });

  const currentContextId = useAssignmentEditorStore((state) => state.currentContextId);
  const questions = useAssignmentFormStore((state) => state.questions);
  const contexts = useAssignmentFormStore((state) => state.contexts);
  const updateQuestion = useAssignmentFormStore((state) => state.updateQuestion);
  const updateContext = useAssignmentFormStore((state) => state.updateContext);

  // Build contexts map
  const contextsMap = useMemo(() => {
    const map = new Map<string, AssignmentContext>();
    contexts.forEach((ctx) => map.set(ctx.id, ctx));
    return map;
  }, [contexts]);

  // Group questions by context
  const groups = useMemo(() => groupQuestionsByContext(questions, contextsMap), [questions, contextsMap]);

  // Find selected context group
  const selectedContextGroup = useMemo(() => {
    if (!currentContextId) return null;
    return groups.find((g) => g.type === 'context' && g.contextId === currentContextId);
  }, [groups, currentContextId]);

  // Get start number for context group
  const contextStartNumber = useMemo(() => {
    if (!selectedContextGroup) return 1;
    const firstQuestion = selectedContextGroup.questions[0];
    if (!firstQuestion) return 1;
    return getQuestionDisplayNumber(groups, firstQuestion.question.id);
  }, [groups, selectedContextGroup]);

  // Handler for question changes within the context group
  const handleContextQuestionChange = useCallback(
    (questionId: string, updatedQuestion: Question) => {
      const qIndex = questions.findIndex((q) => q.question.id === questionId);
      if (qIndex !== -1) {
        updateQuestion(qIndex, {
          question: {
            ...questions[qIndex].question,
            ...updatedQuestion,
          },
        });
      }
    },
    [questions, updateQuestion]
  );

  // Handler for context updates
  const handleContextUpdate = useCallback(
    (updates: Partial<AssignmentContext>) => {
      if (currentContextId) {
        updateContext(currentContextId, updates);
      }
    },
    [currentContextId, updateContext]
  );

  // Empty state
  if (!selectedContextGroup || !selectedContextGroup.context) {
    return (
      <div className="flex min-h-[400px] items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">{tContext('noContextSelected')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b pb-4">
        <div className="flex w-full items-center gap-3">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {selectedContextGroup.context.title || tContext('readingPassage')}
          </h2>
          <Badge variant="secondary">
            {tContext('questionsCount', { count: selectedContextGroup.questions.length })}
          </Badge>
        </div>
      </div>

      {/* Context Group View */}
      <ContextGroupView
        context={selectedContextGroup.context}
        questions={selectedContextGroup.questions}
        viewMode={VIEW_MODE.VIEWING}
        startNumber={contextStartNumber}
        onQuestionChange={handleContextQuestionChange}
        onContextUpdate={handleContextUpdate}
      />

      {/* Tip */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
        {tContext('contextGroupEditTip')}
      </div>
    </div>
  );
};
