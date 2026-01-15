import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MultipleChoiceQuestion, MultipleChoiceAnswer } from '@/features/assignment/types';
import { MarkdownPreview, DifficultyBadge } from '../shared';

import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface MultipleChoiceGradingProps {
  question: MultipleChoiceQuestion;
  answer?: MultipleChoiceAnswer;
  points?: number; // Points allocated for this question in the assignment
  onGradeChange?: (grade: { points: number; feedback?: string }) => void;
}

export const MultipleChoiceGrading = ({
  question,
  answer,
  points = 0,
  onGradeChange,
}: MultipleChoiceGradingProps) => {
  const { t } = useTranslation('questions');

  const selectedOption = answer
    ? question.data.options.find((o) => o.id === answer.selectedOptionId)
    : undefined;
  const isCorrect = selectedOption?.isCorrect || false;
  const autoScore = isCorrect ? points : 0;

  const [awardedPoints, setAwardedPoints] = useState<number>(autoScore);
  const [feedback, setFeedback] = useState<string>('');

  const handlePointsChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setAwardedPoints(numValue);
      onGradeChange?.({ points: numValue, feedback });
    }
  };

  const handleFeedbackChange = (value: string) => {
    setFeedback(value);
    onGradeChange?.({ points: awardedPoints, feedback: value });
  };

  return (
    <div className="space-y-4">
      {/* Question Title */}
      <div className="space-y-2">
        <MarkdownPreview content={question.title} />
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
                'flex items-center gap-3 rounded-md border p-3',
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
      <div className="bg-muted/50 rounded-md p-3 text-sm">
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

      {/* Grading Interface */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-sm font-semibold">{t('multipleChoice.grading.grading')}</h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="points" className="text-sm">
              {t('multipleChoice.grading.pointsAwarded')}
            </Label>
            <Input
              id="points"
              type="number"
              min={0}
              max={points || 100}
              step={0.5}
              value={awardedPoints}
              onChange={(e) => handlePointsChange(e.target.value)}
              className="h-9"
            />
            <p className="text-muted-foreground text-xs">
              {t('multipleChoice.grading.maxPoints', { points: points || 0 })}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="feedback" className="text-sm">
            {t('multipleChoice.grading.teacherFeedback')}
          </Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            placeholder={t('multipleChoice.grading.feedbackPlaceholder')}
            className="min-h-[80px] resize-none"
          />
        </div>
      </div>
    </div>
  );
};
