import { FileQuestion, BookOpen } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { VIEW_MODE } from '@aiprimary/core';
import { QuestionRenderer } from '@/features/question/components/QuestionRenderer';
import { ContextDisplay } from '@/features/context';
import { Badge } from '@ui/badge';
import type { Assignment, AssignmentQuestionWithTopic, AssignmentContext } from '../../types';
import { groupQuestionsByContext, getQuestionDisplayNumber } from '../../utils/questionGrouping';

interface QuestionsListViewPanelProps {
  assignment: Assignment;
}

export const QuestionsListViewPanel = ({ assignment }: QuestionsListViewPanelProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'view.questions' });
  const { t: tContext } = useTranslation('assignment', { keyPrefix: 'context' });

  const questions = (assignment.questions || []) as AssignmentQuestionWithTopic[];
  const assignmentContexts = ((assignment as any).contexts || []) as AssignmentContext[];

  // Build contexts map
  const contextsMap = useMemo(() => {
    const map = new Map<string, AssignmentContext>();
    assignmentContexts.forEach((ctx) => map.set(ctx.id, ctx));
    return map;
  }, [assignmentContexts]);

  // Group questions by context
  const groups = useMemo(() => groupQuestionsByContext(questions, contextsMap), [questions, contextsMap]);

  // Calculate total points
  const totalPoints = useMemo(() => {
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  }, [questions]);

  // Empty state
  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <FileQuestion className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title', { count: 0 })}</h2>
        </div>
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('title', { count: 0 })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <FileQuestion className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('title', { count: questions.length })}
          </h2>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold text-gray-900 dark:text-white">
            {t('totalPoints', { points: totalPoints })}
          </span>
        </div>
      </div>

      {/* Grouped Questions */}
      <div className="space-y-8">
        {groups.map((group) => {
          if (group.type === 'context' && group.context) {
            // Context group — reading passage + questions
            const startNumber = getQuestionDisplayNumber(groups, group.questions[0]?.question?.id);
            return (
              <div key={group.id} className="space-y-4">
                {/* Context header */}
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {group.context.title || tContext('readingPassage')}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {tContext('questionsCount', { count: group.questions.length })}
                  </Badge>
                </div>

                {/* Reading passage */}
                <ContextDisplay context={group.context as any} defaultCollapsed={false} />

                {/* Questions in this context */}
                <div className="space-y-4 border-l-2 border-blue-200 pl-4 dark:border-blue-800">
                  {group.questions.map((aq, index) => {
                    const questionNumber = startNumber + index;
                    return (
                      <div
                        key={aq.question.id}
                        className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t('questionNumber', { number: questionNumber })}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {t('points', { points: aq.points || 0 })}
                          </span>
                        </div>
                        <QuestionRenderer
                          question={aq.question as any}
                          viewMode={VIEW_MODE.VIEWING}
                          points={aq.points}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Standalone question
          const aq = group.questions[0];
          if (!aq?.question?.id) return null;
          const questionNumber = getQuestionDisplayNumber(groups, aq.question.id);
          return (
            <div
              key={group.id}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('questionNumber', { number: questionNumber })}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('points', { points: aq.points || 0 })}
                </span>
              </div>
              <QuestionRenderer
                question={aq.question as any}
                viewMode={VIEW_MODE.VIEWING}
                points={aq.points}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
