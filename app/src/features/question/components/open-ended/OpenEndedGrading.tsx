import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { OpenEndedQuestion, OpenEndedAnswer } from '@/features/assignment/types';
import { MarkdownPreview } from '../shared';

import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

interface OpenEndedGradingProps {
  question: OpenEndedQuestion;
  answer?: OpenEndedAnswer;
  points?: number; // Points allocated for this question in the assignment
  onGradeChange?: (grade: { points: number; feedback?: string }) => void;
}

export const OpenEndedGrading = ({ question, answer, points = 0, onGradeChange }: OpenEndedGradingProps) => {
  const { t } = useTranslation('questions');
  const [awardedPoints, setAwardedPoints] = useState<number>(0);
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

      {/* Student's Answer */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t('openEnded.grading.studentAnswer')}</Label>
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          {answer?.text ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownPreview content={answer.text} />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">{t('openEnded.grading.noAnswer')}</p>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          {t('openEnded.grading.characterCount', {
            count: answer?.text?.length || 0,
            max: question.data.maxLength ? ` / ${question.data.maxLength}` : '',
          })}
        </p>
      </div>

      {/* Expected Answer (Reference) */}
      {question.data.expectedAnswer && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('openEnded.grading.expectedAnswerReference')}</Label>
          <div className="bg-muted/50 rounded-md border p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownPreview content={question.data.expectedAnswer} />
            </div>
          </div>
        </div>
      )}

      {/* Grading Interface */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-sm font-semibold">{t('openEnded.grading.gradingRequired')}</h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="points" className="text-sm">
              {t('openEnded.grading.pointsAwarded')} <span className="text-red-500">*</span>
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
              placeholder={t('openEnded.grading.enterPoints')}
            />
            <p className="text-muted-foreground text-xs">
              {t('openEnded.grading.maxPoints', { points: points || 0 })}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="feedback" className="text-sm">
            {t('openEnded.grading.teacherFeedback')} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            placeholder={t('openEnded.grading.feedbackPlaceholder')}
            className="min-h-[120px] resize-none"
          />
          <p className="text-muted-foreground text-xs">{t('openEnded.grading.feedbackHint')}</p>
        </div>

        {/* Grading Tips */}
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="mb-1 text-sm font-semibold text-amber-900 dark:text-amber-100">
            {t('openEnded.grading.gradingTips')}
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-amber-800 dark:text-amber-200">
            <li>{t('openEnded.grading.tip1')}</li>
            <li>{t('openEnded.grading.tip2')}</li>
            <li>{t('openEnded.grading.tip3')}</li>
            <li>{t('openEnded.grading.tip4')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
