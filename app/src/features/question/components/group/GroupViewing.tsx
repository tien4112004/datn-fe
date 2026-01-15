import { useTranslation } from 'react-i18next';
import type { GroupQuestion } from '@aiprimary/core';
import { VIEW_MODE } from '@/features/assignment/types';
import { SubQuestionList } from './SubQuestionList';

interface GroupViewingProps {
  question: GroupQuestion;
  points?: number;
}

/**
 * GroupViewing Component
 *
 * VIEWING view mode for group questions. Read-only preview showing:
 * - Group description
 * - All sub-questions in preview mode
 * - Total points
 */
export function GroupViewing({ question, points }: GroupViewingProps) {
  const { t } = useTranslation('questions');

  return (
    <div className="space-y-6">
      {/* Question Title */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{question.title}</h3>
        {points !== undefined && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t('common.totalPoints')}: {points}
          </p>
        )}
      </div>

      {/* Group Description */}
      {question.data.description && (
        <div
          className="prose dark:prose-invert max-w-none rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
          dangerouslySetInnerHTML={{ __html: question.data.description }}
        />
      )}

      {/* Sub-Questions in Viewing Mode */}
      <SubQuestionList
        questions={question.data.questions}
        viewMode={VIEW_MODE.VIEWING}
        showNumbers={question.data.showQuestionNumbers}
        shuffle={question.data.shuffleQuestions}
      />
    </div>
  );
}
