import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { OpenEndedQuestion, OpenEndedAnswer } from '@aiprimary/core';
import { MarkdownPreview, QuestionTitle } from '../shared';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { CheckCircle2, Trophy } from 'lucide-react';

interface OpenEndedGradingProps {
  question: OpenEndedQuestion;
  answer?: OpenEndedAnswer;
  points?: number; // Points allocated for this question in the assignment
  grade?: { points: number; feedback?: string }; // Current grade data
  onGradeChange?: (grade: { points: number; feedback?: string }) => void; // Callback when grade changes
}

export const OpenEndedGrading = ({
  question,
  answer,
  points = 0,
  grade,
  onGradeChange,
}: OpenEndedGradingProps) => {
  const { t } = useTranslation('questions');
  const { t: tGrading } = useTranslation('questions', { keyPrefix: 'submissionsGrading' });

  const [awardedPoints, setAwardedPoints] = useState<number>(grade?.points ?? 0);
  const [feedback, setFeedback] = useState<string>(grade?.feedback || '');

  return (
    <div className="space-y-4">
      {/* Question Title */}
      <div className="space-y-2">
        <QuestionTitle content={question.title} />
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
      </div>

      {/* Student's Answer */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t('openEnded.grading.studentAnswer')}</Label>
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-800 dark:bg-blue-900/20">
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
          <div className="bg-muted/50 rounded-md border px-4 py-2">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownPreview content={question.data.expectedAnswer} />
            </div>
          </div>
        </div>
      )}

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
