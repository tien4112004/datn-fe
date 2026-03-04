import { useTranslation } from 'react-i18next';
import type { MultipleChoiceQuestion, MultipleChoiceAnswer } from '@aiprimary/core';
import type { Grade } from '@aiprimary/core';
import { MarkdownPreview, QuestionTitle, GradeFeedback } from '../shared';

import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@ui/lib/utils';

interface MultipleChoiceAfterAssessmentProps {
  question: MultipleChoiceQuestion;
  answer?: MultipleChoiceAnswer;
  points?: number; // Points allocated for this question in the assignment
  grade?: Grade; // Grade for this question
  hideHeader?: boolean; // Hide type label and difficulty badge when used as sub-question
  showCorrectAnswers?: boolean; // Whether to reveal correct answers (default: true)
}

export const MultipleChoiceAfterAssessment = ({
  question,
  answer,
  points = 0,
  grade,
  hideHeader = false,
  showCorrectAnswers = true,
}: MultipleChoiceAfterAssessmentProps) => {
  const { t } = useTranslation('questions');
  const selectedOption = answer
    ? question.data.options.find((o) => o.id === answer.selectedOptionId)
    : undefined;
  const isCorrect = selectedOption?.isCorrect || false;

  return (
    <div className="space-y-4">
      {/* Question Title */}
      <div className="space-y-2">
        <QuestionTitle content={question.title} />
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
      </div>

      {/* Grade Feedback */}
      {!hideHeader && showCorrectAnswers && (
        <GradeFeedback
          grade={grade}
          maxPoints={points}
          autoScore={isCorrect ? points : 0}
          isAutoCorrect={isCorrect}
        />
      )}

      {/* Options with feedback */}
      <div className="space-y-2">
        {question.data.options.map((option, index) => {
          const isSelected = answer ? option.id === answer.selectedOptionId : false;
          const isCorrectOption = option.isCorrect;
          const showAsCorrect = showCorrectAnswers && isCorrectOption;
          const showAsWrong = showCorrectAnswers && isSelected && !isCorrectOption;

          return (
            <div
              key={option.id}
              className={cn(
                'flex items-center gap-3 rounded-md border px-3 py-1.5',
                showAsCorrect && 'border-green-200 bg-green-50 dark:bg-green-900/20',
                showAsWrong && 'border-red-200 bg-red-50 dark:bg-red-900/20',
                !showCorrectAnswers && isSelected && 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
              )}
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                {showAsCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {showAsWrong && <XCircle className="h-5 w-5 text-red-600" />}
                {!showAsCorrect && !showAsWrong && (
                  <div className={cn('flex h-6 w-6 items-center justify-center rounded-full text-sm', isSelected ? 'bg-blue-600 text-white' : 'bg-muted')}>
                    {String.fromCharCode(65 + index)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <MarkdownPreview content={option.text} />
                {option.imageUrl && (
                  <img
                    src={option.imageUrl}
                    alt={`Option ${String.fromCharCode(65 + index)}`}
                    className="mt-2 max-h-32 rounded-md border"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {showCorrectAnswers && question.explanation && (
        <div className="bg-muted/50 rounded-md p-4">
          <h4 className="mb-2 font-semibold">{t('common.explanation')}:</h4>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}
    </div>
  );
};
