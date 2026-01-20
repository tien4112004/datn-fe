import type { GroupQuestion } from '@aiprimary/core';
import { SubQuestionList } from './SubQuestionList';
import { QuestionNumber } from '../shared';

interface GroupViewingProps {
  question: GroupQuestion;
  points?: number;
  number?: number;
}

/**
 * GroupViewing Component (Admin)
 *
 * VIEWING view mode for group questions. Read-only preview showing:
 * - Group description
 * - All sub-questions in preview mode
 * - Total points
 */
export function GroupViewing({ question, points, number }: GroupViewingProps) {
  return (
    <div className="space-y-4">
      {number !== undefined && (
        <div className="flex items-center gap-3">
          <QuestionNumber number={number} />
        </div>
      )}

      {/* Question Title */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{question.title}</h3>
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
        {points !== undefined && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Total Points: {points}</p>
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
        viewMode="viewing"
        showNumbers={question.data.showQuestionNumbers}
        shuffle={question.data.shuffleQuestions}
      />
    </div>
  );
}
