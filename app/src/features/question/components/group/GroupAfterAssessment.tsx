import { useTranslation } from 'react-i18next';
import type { GroupQuestion, Answer } from '@aiprimary/core';
import { VIEW_MODE } from '@/features/assignment/types';
import { SubQuestionList } from './SubQuestionList';
import { QuestionNumber } from '../shared';

interface GroupAfterAssessmentProps {
  question: GroupQuestion;
  answer?: Answer;
  points?: number;
  number?: number;
}

/**
 * GroupAfterAssessment Component
 *
 * AFTER_ASSESSMENT view mode for group questions. Shows:
 * - Group description
 * - Student's answers with correct answers
 * - Explanations for each sub-question
 * - Score breakdown
 */
export function GroupAfterAssessment({ question, answer, points, number }: GroupAfterAssessmentProps) {
  const { t } = useTranslation('questions');
  const userAnswers = (answer as any)?.subAnswers || {};
  const earnedPoints = (answer as any)?.earnedPoints;

  return (
    <div className="space-y-4">
      {number !== undefined && (
        <div className="flex items-center gap-3">
          <QuestionNumber number={number} />
        </div>
      )}
      {/* Question Title and Score */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{question.title}</h3>
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
        {points !== undefined && (
          <div className="mt-2 flex items-center gap-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.totalPoints')}: {points}
            </p>
            {earnedPoints !== undefined && (
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {t('common.score')}: {earnedPoints} / {points}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Group Description */}
      {question.data.description && (
        <div
          className="prose dark:prose-invert max-w-none rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
          dangerouslySetInnerHTML={{ __html: question.data.description }}
        />
      )}

      {/* Sub-Questions in After Assessment Mode */}
      <SubQuestionList
        questions={question.data.questions}
        viewMode={VIEW_MODE.AFTER_ASSESSMENT}
        answers={userAnswers}
        showNumbers={question.data.showQuestionNumbers}
        shuffle={false} // Don't shuffle in review mode
      />
    </div>
  );
}
