import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FillInBlankQuestion, FillInBlankAnswer } from '@aiprimary/core';
import { QuestionTitle } from '../shared';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { cn } from '@ui/lib/utils';

interface FillInBlankGradingProps {
  question: FillInBlankQuestion;
  answer?: FillInBlankAnswer;
  points?: number; // Points allocated for this question in the assignment
  grade?: { points: number; feedback?: string }; // Current grade data
  onGradeChange?: (grade: { points: number; feedback?: string }) => void; // Callback when grade changes
}

export const FillInBlankGrading = ({
  question,
  answer,
  points = 0,
  grade,
  onGradeChange,
}: FillInBlankGradingProps) => {
  const { t } = useTranslation('questions');
  const { t: tGrading } = useTranslation('questions', { keyPrefix: 'submissionsGrading' });

  const [awardedPoints, setAwardedPoints] = useState<number>(grade?.points ?? 0);
  const [feedback, setFeedback] = useState<string>(grade?.feedback || '');

  // Calculate score: each correct blank gets equal points
  const blankSegments = question.data.segments.filter((s) => s.type === 'blank');
  const pointsPerBlank = points / blankSegments.length;

  const isBlankCorrect = (segmentId: string, studentAnswer: string): boolean => {
    const segment = question.data.segments.find((s) => s.id === segmentId);
    if (!segment || segment.type !== 'blank') return false;

    const correctAnswer = segment.content;
    const caseSensitive = question.data.caseSensitive || false;

    // Return false if student answer or correct answer is undefined/empty
    if (!studentAnswer || !correctAnswer) return false;

    // Check main answer
    const mainMatch = caseSensitive
      ? studentAnswer === correctAnswer
      : studentAnswer.toLowerCase() === correctAnswer.toLowerCase();

    if (mainMatch) return true;

    // Check acceptable alternatives
    if (segment.acceptableAnswers) {
      return segment.acceptableAnswers.some((acceptable) => {
        if (!acceptable) return false;
        return caseSensitive
          ? studentAnswer === acceptable
          : studentAnswer.toLowerCase() === acceptable.toLowerCase();
      });
    }

    return false;
  };

  // Calculate auto score
  let correctBlanks = 0;
  answer?.blanks.forEach((blank) => {
    if (isBlankCorrect(blank.segmentId, blank.value)) {
      correctBlanks++;
    }
  });
  const autoScore = correctBlanks * pointsPerBlank;

  const getStudentAnswer = (segmentId: string): string => {
    const blank = answer?.blanks.find((b) => b.segmentId === segmentId);
    return blank?.value || '';
  };

  return (
    <div className="space-y-4">
      {/* Question Title */}
      {question.title && (
        <div className="space-y-2">
          <QuestionTitle content={question.title} variant="plain" />
          {question.titleImageUrl && (
            <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
          )}
        </div>
      )}

      {/* Question with student's answers */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t('fillInBlank.grading.studentAnswer')}</Label>
        <div className="bg-muted/50 rounded-md p-4 text-sm leading-relaxed">
          {question.data.segments.map((segment) => {
            if (segment.type === 'text') {
              return (
                <span key={segment.id} className="font-mono">
                  {segment.content}
                </span>
              );
            }

            const studentAnswer = getStudentAnswer(segment.id);
            const isCorrect = isBlankCorrect(segment.id, studentAnswer);

            return (
              <span
                key={segment.id}
                className={cn(
                  'mx-1 inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono',
                  isCorrect
                    ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                )}
              >
                {isCorrect ? (
                  <CheckCircle2 className="inline h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="inline h-3 w-3 text-red-600" />
                )}
                <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                  {studentAnswer || '(empty)'}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Detailed Blank Review */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t('fillInBlank.grading.blankByBlankReview')}</Label>
        <div className="space-y-2">
          {blankSegments.map((segment, index) => {
            const studentAnswer = getStudentAnswer(segment.id);
            const isCorrect = isBlankCorrect(segment.id, studentAnswer);

            return (
              <div
                key={segment.id}
                className={cn(
                  'rounded-md border p-3 text-sm',
                  isCorrect
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">
                      {t('fillInBlank.grading.blankNumber', { number: index + 1 })}:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">{t('fillInBlank.grading.studentLabel')}</span>
                        <span className="font-mono">
                          {studentAnswer || t('fillInBlank.afterAssessment.empty')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('fillInBlank.grading.correctLabel')}</span>
                        <span className="font-mono">{segment.content}</span>
                      </div>
                    </div>
                    {segment.acceptableAnswers && segment.acceptableAnswers.length > 0 && (
                      <p className="text-muted-foreground text-xs">
                        {t('fillInBlank.grading.alsoAcceptable')}
                        {segment.acceptableAnswers.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Case Sensitivity Info */}
      {question.data.caseSensitive && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          {t('fillInBlank.grading.caseSensitiveInfo')}
        </div>
      )}

      {/* Auto Score Info */}
      <div className="bg-muted/50 rounded-md p-3 text-sm">
        <p>
          <span className="font-semibold">{t('fillInBlank.grading.autoCalculatedScore')}</span>
          <span className="text-blue-600">
            {t('fillInBlank.grading.correctBlanksScore', {
              correct: correctBlanks,
              total: blankSegments.length,
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
