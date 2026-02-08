import { FileQuestion } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Assignment, AssignmentQuestionWithTopic, AssignmentTopic } from '../../types';
import { QuestionListViewItem } from './QuestionListViewItem';

interface QuestionsListViewPanelProps {
  assignment: Assignment;
}

export const QuestionsListViewPanel = ({ assignment }: QuestionsListViewPanelProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'viewer.questionsList' });

  const questions = (assignment.questions || []) as AssignmentQuestionWithTopic[];
  const topics = (assignment.topics || []) as AssignmentTopic[];

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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        </div>
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('emptyMessage')}</p>
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {t('totalQuestions', { count: questions.length })}
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {t('totalPoints', { points: totalPoints })}
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {questions
          .filter((question) => question.question?.id)
          .map((question, index) => (
            <QuestionListViewItem
              key={question.question.id}
              question={question}
              index={index}
              topics={topics}
            />
          ))}
      </div>
    </div>
  );
};
