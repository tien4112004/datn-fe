import type { MatchingQuestion, MatchingAnswer } from '@/features/assignment/types';
import { MarkdownPreview, AnswerFeedback, DifficultyBadge } from '../shared';

import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface MatchingAfterAssessmentProps {
  question: MatchingQuestion;
  answer?: MatchingAnswer;
  points?: number; // Points allocated for this question in the assignment
}

export const MatchingAfterAssessment = ({ question, answer, points = 0 }: MatchingAfterAssessmentProps) => {
  const answerMap = new Map(answer?.matches.map((m) => [m.rightId, m.leftId]) || []);

  // Check correctness for each pair
  const results = question.data.pairs.map((pair) => {
    const studentMatchedLeftId = answerMap.get(pair.id);
    const isCorrect = studentMatchedLeftId === pair.id;
    const studentMatchedPair = studentMatchedLeftId
      ? question.data.pairs.find((p) => p.id === studentMatchedLeftId)
      : undefined;

    return {
      correctPair: pair,
      studentMatchedPair,
      isCorrect,
    };
  });

  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalCount = results.length;
  const isFullyCorrect = correctCount === totalCount;
  const score = isFullyCorrect ? points : Math.round((correctCount / totalCount) * points);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Matching Question</h3>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </div>

      {/* Question Title */}
      <div className="space-y-2">
        <MarkdownPreview content={question.title} />
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
      </div>

      {/* Answer Feedback */}
      <AnswerFeedback isCorrect={isFullyCorrect} score={score} totalPoints={points} />

      {/* Results */}
      <div className="space-y-3">
        <h4 className="font-semibold">Your Matches:</h4>
        {results.map((result, index) => (
          <div
            key={result.correctPair.id}
            className={cn(
              'rounded-md border p-4',
              result.isCorrect
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
            )}
          >
            <div className="flex items-start gap-3">
              {/* Result Icon */}
              <div className="mt-1">
                {result.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>

              {/* Student's Match */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Student's Left Item */}
                  {result.studentMatchedPair ? (
                    <div className="min-w-[200px] flex-1 rounded bg-blue-100 px-3 py-1 dark:bg-blue-900/30">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                          {question.data.pairs.findIndex((p) => p.id === result.studentMatchedPair?.id) + 1}
                        </span>
                        <MarkdownPreview content={result.studentMatchedPair.left} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground min-w-[200px] flex-1 rounded bg-gray-100 px-3 py-1 italic dark:bg-gray-800">
                      (No match)
                    </div>
                  )}

                  <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />

                  {/* Right Item */}
                  <div className="min-w-[200px] flex-1 rounded bg-green-100 px-3 py-1 dark:bg-green-900/30">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-medium text-white">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <MarkdownPreview content={result.correctPair.right} />
                    </div>
                  </div>
                </div>

                {/* Show correct match if wrong */}
                {!result.isCorrect && (
                  <div className="text-muted-foreground border-t pl-7 pt-2 text-sm">
                    <strong>Correct match:</strong>
                    <div className="mt-1 inline-block rounded bg-white px-2 py-1 dark:bg-gray-900">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                        {question.data.pairs.findIndex((p) => p.id === result.correctPair.id) + 1}
                      </span>
                      <MarkdownPreview content={result.correctPair.left} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Explanation */}
      {question.explanation && (
        <div className="bg-muted/50 rounded-md p-4">
          <h4 className="mb-2 font-semibold">Explanation:</h4>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}

      {/* Score Summary */}
      <p className="text-muted-foreground text-sm">
        {correctCount} out of {totalCount} pairs correct • Score: {score}/{points || 0}
      </p>
    </div>
  );
};
