import { useState } from 'react';
import type { MatchingQuestion, MatchingAnswer } from '../../types';
import { MarkdownPreview, DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface MatchingGradingProps {
  question: MatchingQuestion;
  answer?: MatchingAnswer;
  onGradeChange?: (grade: { points: number; feedback?: string }) => void;
}

export const MatchingGrading = ({ question, answer, onGradeChange }: MatchingGradingProps) => {
  // Calculate score: each correct match gets equal points
  const pointsPerPair = question.points ? question.points / question.data.pairs.length : 0;
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

  const [points, setPoints] = useState<number>(autoScore);
  const [feedback, setFeedback] = useState<string>('');

  const handlePointsChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setPoints(numValue);
      onGradeChange?.({ points: numValue, feedback });
    }
  };

  const handleFeedbackChange = (value: string) => {
    setFeedback(value);
    onGradeChange?.({ points, feedback: value });
  };

  const isMatchCorrect = (leftId: string, rightId: string) => {
    // A match is correct if both IDs belong to the same pair
    const leftPair = question.data.pairs.find((p) => p.id === leftId);
    const rightPair = question.data.pairs.find((p) => p.id === rightId);
    return leftPair && rightPair && leftPair.id === rightPair.id;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Matching Question - Grading</CardTitle>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Title */}
        <div className="space-y-2">
          <MarkdownPreview content={question.title} />
          {question.titleImageUrl && (
            <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
          )}
        </div>

        {/* Student's Matches */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Student Answer:</Label>
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
                    'flex items-center gap-3 rounded-md border p-3',
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
                      <span className="font-semibold">Correct: </span>
                      <MarkdownPreview content={leftPair.right} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Correct Pairs Reference */}
        <div className="bg-muted/50 space-y-2 rounded-md p-3">
          <Label className="text-sm font-semibold">Correct Pairs:</Label>
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
        <div className="bg-muted/50 rounded-md p-3 text-sm">
          <p>
            <span className="font-semibold">Auto-calculated Score: </span>
            <span className="text-blue-600">
              {correctMatches}/{question.data.pairs.length} correct matches - {autoScore.toFixed(1)} points
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
                max={question.points || 100}
                step={0.5}
                value={points}
                onChange={(e) => handlePointsChange(e.target.value)}
                className="h-9"
              />
              <p className="text-muted-foreground text-xs">Max: {question.points || 0} points</p>
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
      </CardContent>
    </Card>
  );
};
