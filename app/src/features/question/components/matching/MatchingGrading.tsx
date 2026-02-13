import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MatchingQuestion, MatchingAnswer } from '@/features/assignment/types';
import { MarkdownPreview, QuestionTitle } from '../shared';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { CheckCircle2, XCircle, ArrowRight, Trophy } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface MatchingGradingProps {
  question: MatchingQuestion;
  answer?: MatchingAnswer;
  points?: number; // Points allocated for this question in the assignment
  grade?: { points: number; feedback?: string }; // Current grade data
  onGradeChange?: (grade: { points: number; feedback?: string }) => void; // Callback when grade changes
}

export const MatchingGrading = ({
  question,
  answer,
  points = 0,
  grade,
  onGradeChange,
}: MatchingGradingProps) => {
  const { t } = useTranslation('questions');
  const { t: tGrading } = useTranslation('assignment', { keyPrefix: 'submissions.grading' });

  const [awardedPoints, setAwardedPoints] = useState<number>(grade?.points ?? 0);
  const [feedback, setFeedback] = useState<string>(grade?.feedback || '');

  // Calculate score: each correct match gets equal points
  const pointsPerPair = points / question.data.pairs.length;
  let correctMatches = 0;

  answer?.matches.forEach((match) => {
    // In the correct answer, leftId and rightId should belong to the same pair
    const leftPair = question.data.pairs.find((p) => p.id === match.leftId);
    const rightPair = question.data.pairs.find((p) => p.id === match.rightId);

    // Check if they're from the same pair (correct match)
    if (leftPair && rightPair && leftPair.id === rightPair.id) {
      correctMatches++;
    }
  });

  const autoScore = correctMatches * pointsPerPair;

  const isMatchCorrect = (leftId: string, rightId: string) => {
    // A match is correct if both IDs belong to the same pair
    const leftPair = question.data.pairs.find((p) => p.id === leftId);
    const rightPair = question.data.pairs.find((p) => p.id === rightId);
    return leftPair && rightPair && leftPair.id === rightPair.id;
  };

  return (
    <div className="space-y-4">
      {/* Question Title */}
      <div className="space-y-2">
        <QuestionTitle content={question.title} />
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
      </div>

      {/* Student's Matches */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t('matching.grading.studentAnswer')}</Label>
        <div className="space-y-2">
          {answer?.matches.map((match) => {
            const isCorrect = isMatchCorrect(match.leftId, match.rightId);
            const leftPair = question.data.pairs.find((p) => p.id === match.leftId);
            const rightPair = question.data.pairs.find((p) => p.id === match.rightId);

            if (!leftPair || !rightPair) return null;

            return (
              <div
                key={`${match.leftId}-${match.rightId}`}
                className={cn(
                  'flex items-center gap-3 rounded-md border px-3 py-2',
                  isCorrect
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                )}
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex flex-1 items-center gap-2">
                  <div className="flex-1">
                    <MarkdownPreview content={leftPair.left} />
                  </div>
                  <ArrowRight className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                  <div className="flex-1">
                    <MarkdownPreview content={rightPair.right} />
                  </div>
                </div>

                {!isCorrect && leftPair && (
                  <div className="text-muted-foreground border-l pl-3 text-xs">
                    <span className="font-semibold">{t('matching.grading.correctLabel')}</span>
                    <MarkdownPreview content={leftPair.right} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Correct Pairs Reference */}
      <div className="bg-muted/50 space-y-2 rounded-md px-3 py-2">
        <Label className="text-sm font-semibold">{t('matching.grading.correctPairs')}</Label>
        <div className="space-y-1.5">
          {question.data.pairs.map((pair) => (
            <div key={pair.id} className="flex items-center gap-2 text-sm">
              <MarkdownPreview content={pair.left} />
              <ArrowRight className="text-muted-foreground h-3 w-3" />
              <MarkdownPreview content={pair.right} />
            </div>
          ))}
        </div>
      </div>

      {/* Auto Score Info */}
      <div className="bg-muted/50 rounded-md px-3 py-2 text-sm">
        <p>
          <span className="font-semibold">{t('matching.grading.autoCalculatedScore')}</span>
          <span className="text-blue-600">
            {t('matching.grading.correctMatchesScore', {
              correct: correctMatches,
              total: question.data.pairs.length,
              score: autoScore.toFixed(1),
            })}
          </span>
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
