import { useState } from 'react';
import type { FillInBlankQuestion, FillInBlankAnswer } from '../../types';
import { DifficultyBadge } from '../shared';

import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FillInBlankGradingProps {
  question: FillInBlankQuestion;
  answer?: FillInBlankAnswer;
  points?: number; // Points allocated for this question in the assignment
  onGradeChange?: (grade: { points: number; feedback?: string }) => void;
}

export const FillInBlankGrading = ({
  question,
  answer,
  points = 0,
  onGradeChange,
}: FillInBlankGradingProps) => {
  // Calculate score: each correct blank gets equal points
  const blankSegments = question.data.segments.filter((s) => s.type === 'blank');
  const pointsPerBlank = points / blankSegments.length;

  const isBlankCorrect = (segmentId: string, studentAnswer: string): boolean => {
    const segment = question.data.segments.find((s) => s.id === segmentId);
    if (!segment || segment.type !== 'blank') return false;

    const correctAnswer = segment.content;
    const caseSensitive = question.data.caseSensitive || false;

    // Check main answer
    const mainMatch = caseSensitive
      ? studentAnswer === correctAnswer
      : studentAnswer.toLowerCase() === correctAnswer.toLowerCase();

    if (mainMatch) return true;

    // Check acceptable alternatives
    if (segment.acceptableAnswers) {
      return segment.acceptableAnswers.some((acceptable) =>
        caseSensitive
          ? studentAnswer === acceptable
          : studentAnswer.toLowerCase() === acceptable.toLowerCase()
      );
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

  const getStudentAnswer = (segmentId: string): string => {
    const blank = answer?.blanks.find((b) => b.segmentId === segmentId);
    return blank?.value || '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Fill In Blank Question - Grading</h3>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </div>

      {/* Question Title */}
      {question.title && (
        <div className="space-y-2">
          <p className="font-medium">{question.title}</p>
          {question.titleImageUrl && (
            <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
          )}
        </div>
      )}

      {/* Question with student's answers */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Student Answer:</Label>
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
        <Label className="text-sm font-semibold">Blank-by-Blank Review:</Label>
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
                    <p className="font-semibold">Blank {index + 1}:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Student: </span>
                        <span className="font-mono">{studentAnswer || '(empty)'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Correct: </span>
                        <span className="font-mono">{segment.content}</span>
                      </div>
                    </div>
                    {segment.acceptableAnswers && segment.acceptableAnswers.length > 0 && (
                      <p className="text-muted-foreground text-xs">
                        Also acceptable: {segment.acceptableAnswers.join(', ')}
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
          ⚠️ This question is case-sensitive
        </div>
      )}

      {/* Auto Score Info */}
      <div className="bg-muted/50 rounded-md p-3 text-sm">
        <p>
          <span className="font-semibold">Auto-calculated Score: </span>
          <span className="text-blue-600">
            {correctBlanks}/{blankSegments.length} correct blanks - {autoScore.toFixed(1)} points
          </span>
        </p>
      </div>

      {/* Grading Interface */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-sm font-semibold">Grading</h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="points" className="text-sm">
              Points Awarded
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
            <p className="text-muted-foreground text-xs">Max: {points || 0} points</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="feedback" className="text-sm">
            Teacher Feedback (Optional)
          </Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            placeholder="Add comments or feedback for the student..."
            className="min-h-[80px] resize-none"
          />
        </div>
      </div>
    </div>
  );
};
