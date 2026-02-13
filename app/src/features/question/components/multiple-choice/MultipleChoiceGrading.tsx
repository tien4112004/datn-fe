import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MultipleChoiceQuestion, MultipleChoiceAnswer } from '@/features/assignment/types';
import { MarkdownPreview, QuestionTitle } from '../shared';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface MultipleChoiceGradingProps {
  question: MultipleChoiceQuestion;
  answer?: MultipleChoiceAnswer;
  points?: number; // Points allocated for this question in the assignment
  grade?: { points: number; feedback?: string }; // Current grade data
  onGradeChange?: (grade: { points: number; feedback?: string }) => void; // Callback when grade changes
}

export const MultipleChoiceGrading = ({
  question,
  answer,
  points = 0,
  grade,
  onGradeChange,
}: MultipleChoiceGradingProps) => {
  const { t } = useTranslation('questions');
  const { t: tGrading } = useTranslation('assignment', { keyPrefix: 'submissions.grading' });

  const [awardedPoints, setAwardedPoints] = useState<number>(grade?.points ?? 0);
  const [feedback, setFeedback] = useState<string>(grade?.feedback || '');

  const selectedOption = answer
    ? question.data.options.find((o) => o.id === answer.selectedOptionId)
    : undefined;
  const isCorrect = selectedOption?.isCorrect || false;
  const autoScore = isCorrect ? points : 0;

  return (
    <div className="space-y-4">
      {/* Question Title */}
      <div className="space-y-2">
        <QuestionTitle content={question.title} />
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
      </div>

      {/* Options with student selection */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t('multipleChoice.grading.studentAnswer')}</Label>
        {question.data.options.map((option, index) => {
          const isSelected = answer ? option.id === answer.selectedOptionId : false;
          const isCorrectOption = option.isCorrect;

          return (
            <div
              key={option.id}
              className={cn(
                'flex items-center gap-3 rounded-md border px-3 py-2',
                isCorrectOption && 'border-green-200 bg-green-50 dark:bg-green-900/20',
                isSelected && !isCorrectOption && 'border-red-200 bg-red-50 dark:bg-red-900/20',
                isSelected && isCorrectOption && 'border-green-300 bg-green-50 dark:bg-green-900/30'
              )}
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                {isCorrectOption && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {isSelected && !isCorrectOption && <XCircle className="h-5 w-5 text-red-600" />}
                {!isSelected && !isCorrectOption && (
                  <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-sm">
                    {String.fromCharCode(65 + index)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <MarkdownPreview content={option.text} />
                  {isSelected && (
                    <span className="text-xs font-semibold text-blue-600">
                      {t('multipleChoice.grading.studentAnswerTag')}
                    </span>
                  )}
                </div>
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

      {/* Auto Score Info */}
      <div className="bg-muted/50 rounded-md px-3 py-2 text-sm">
        <p>
          <span className="font-semibold">{t('multipleChoice.grading.autoCalculatedScore')}</span>
          {isCorrect ? (
            <span className="text-green-600">
              {t('multipleChoice.grading.correctScore', { score: autoScore })}
            </span>
          ) : (
            <span className="text-red-600">{t('multipleChoice.grading.incorrectScore')}</span>
          )}
        </p>
      </div>

      {/* Grading Section */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900 dark:bg-blue-950/20">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
          <Trophy className="h-4 w-4" />
          {tGrading('grading')}
        </h3>

        <div className="space-y-4">
          {/* Points Input */}
          <div>
            <Label htmlFor={`points-${question.id}`} className="mb-2 block text-sm font-medium">
              {tGrading('pointsAwarded')}
            </Label>
            <div className="flex items-center gap-3">
              <input
                id={`points-${question.id}`}
                type="number"
                min="0"
                max={points || 100}
                step="0.5"
                value={awardedPoints}
                onChange={(e) => {
                  const newPoints = parseFloat(e.target.value) || 0;
                  const clampedPoints = Math.min(Math.max(0, newPoints), points || 100);
                  setAwardedPoints(clampedPoints);
                  onGradeChange?.({ points: clampedPoints, feedback });
                }}
                className="w-24 rounded-md border border-gray-300 px-3 py-2 text-center text-lg font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <span className="text-muted-foreground text-sm">
                {tGrading('outOf')} <span className="font-semibold">{points || 0}</span> {tGrading('points')}
              </span>
              {awardedPoints === (points || 0) && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            </div>
          </div>

          {/* Feedback Input */}
          <div>
            <Label htmlFor={`feedback-${question.id}`} className="mb-2 block text-sm font-medium">
              {tGrading('feedbackForQuestion')}
            </Label>
            <Textarea
              id={`feedback-${question.id}`}
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                onGradeChange?.({ points: awardedPoints, feedback: e.target.value });
              }}
              placeholder={tGrading('questionFeedbackPlaceholder')}
              className="min-h-[80px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
