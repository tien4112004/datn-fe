import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { QuestionRenderer } from '@/features/question/components/QuestionRenderer';
import { ContextDisplay, type Context } from '@/features/context';
import { EditableContextDisplay } from './EditableContextDisplay';
import type { AssignmentQuestionWithTopic, AssignmentContext, ViewMode } from '../../types';
import type { Answer, Question } from '@aiprimary/core';
import type { GroupingContext } from '../../utils/questionGrouping';

interface ContextGroupViewProps {
  context: GroupingContext;
  questions: AssignmentQuestionWithTopic[];
  viewMode: ViewMode;
  /** Starting number for question numbering (1-indexed) */
  startNumber?: number;
  /** Callback when answer changes (for DOING mode) */
  onAnswerChange?: (questionId: string, answer: Answer) => void;
  /** Callback when question changes (for EDITING mode) */
  onQuestionChange?: (questionId: string, question: Question) => void;
  /** Callback when grade changes (for GRADING mode) */
  onGradeChange?: (questionId: string, grade: { points: number; feedback?: string }) => void;
  /** Callback when context is updated (for EDITING mode with AssignmentContext) */
  onContextUpdate?: (updates: Partial<AssignmentContext>) => void;
  /** Map of answers for each question (for DOING, AFTER_ASSESSMENT, GRADING modes) */
  answers?: Map<string, Answer>;
}

export const ContextGroupView = ({
  context,
  questions,
  viewMode,
  startNumber = 1,
  onAnswerChange,
  onQuestionChange,
  onGradeChange,
  onContextUpdate,
  answers,
}: ContextGroupViewProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'context' });

  // Check if context is an AssignmentContext (has sourceContextId field) and editing is enabled
  const isAssignmentContext = 'sourceContextId' in context || onContextUpdate;

  return (
    <div className="flex h-full flex-col">
      {/* Context Display - Sticky at top */}
      <div className="flex-shrink-0">
        {isAssignmentContext && onContextUpdate ? (
          <EditableContextDisplay
            context={context as AssignmentContext}
            onUpdate={onContextUpdate}
            defaultCollapsed={false}
            readOnly={false}
          />
        ) : (
          <ContextDisplay context={context as Context} defaultCollapsed={false} />
        )}
      </div>

      {/* Questions - Scrollable */}
      <ScrollArea className="mt-4 flex-1">
        <div className="space-y-6 pr-4">
          {questions.map((aq, index) => {
            const questionNumber = startNumber + index;
            const answer = answers?.get(aq.question.id);

            return (
              <div
                key={aq.question.id}
                className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('questionInGroup', {
                      current: index + 1,
                      total: questions.length,
                      number: questionNumber,
                    })}
                  </h3>
                  <span className="text-muted-foreground text-sm">
                    {aq.points} {t('points')}
                  </span>
                </div>
                <QuestionRenderer
                  question={aq.question as Question}
                  viewMode={viewMode}
                  answer={answer}
                  points={aq.points}
                  number={questionNumber}
                  onChange={onQuestionChange ? (q) => onQuestionChange(aq.question.id, q) : undefined}
                  onAnswerChange={onAnswerChange ? (a) => onAnswerChange(aq.question.id, a) : undefined}
                  onGradeChange={onGradeChange ? (g) => onGradeChange(aq.question.id, g) : undefined}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
