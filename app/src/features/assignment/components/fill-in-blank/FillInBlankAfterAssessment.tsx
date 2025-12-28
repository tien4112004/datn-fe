import type { FillInBlankQuestion, FillInBlankAnswer } from '../../types';
import { MarkdownPreview, AnswerFeedback, DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FillInBlankAfterAssessmentProps {
  question: FillInBlankQuestion;
  answer?: FillInBlankAnswer;
}

export const FillInBlankAfterAssessment = ({ question, answer }: FillInBlankAfterAssessmentProps) => {
  const blankSegments = question.data.segments.filter((s) => s.type === 'blank');
  const answerMap = new Map(answer?.blanks.map((b) => [b.segmentId, b.value]) || []);

  // Check correctness
  const results = blankSegments.map((segment) => {
    const studentAnswer = answerMap.get(segment.id) || '';
    const correctAnswer = segment.content;
    const acceptableAnswers = segment.acceptableAnswers || [];
    const allAcceptableAnswers = [correctAnswer, ...acceptableAnswers];

    const isCorrect = question.data.caseSensitive
      ? allAcceptableAnswers.includes(studentAnswer)
      : allAcceptableAnswers.some((a) => a.toLowerCase() === studentAnswer.toLowerCase());

    return {
      segmentId: segment.id,
      studentAnswer,
      correctAnswer,
      isCorrect,
    };
  });

  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalCount = results.length;
  const isFullyCorrect = correctCount === totalCount;
  const score = isFullyCorrect
    ? question.points
    : Math.round((correctCount / totalCount) * (question.points || 0));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Fill In Blank Question</CardTitle>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        {question.title && (
          <div className="space-y-2">
            <p className="font-medium">{question.title}</p>
            {question.titleImageUrl && (
              <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
            )}
          </div>
        )}

        {/* Answer Feedback */}
        <AnswerFeedback isCorrect={isFullyCorrect} score={score} totalPoints={question.points} />

        {/* Question with results */}
        <div className="bg-muted/50 rounded-md p-4 text-sm leading-relaxed">
          {question.data.segments.map((segment) => {
            if (segment.type === 'text') {
              return (
                <span key={segment.id} className="font-mono">
                  {segment.content}
                </span>
              );
            }

            const result = results.find((r) => r.segmentId === segment.id);
            if (!result) return null;

            return (
              <span key={segment.id} className="mx-1 inline-flex items-center">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded px-2 py-1 font-mono',
                    result.isCorrect
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100'
                  )}
                >
                  {result.isCorrect ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  <span>{result.studentAnswer || '(empty)'}</span>
                </span>
              </span>
            );
          })}
        </div>

        {/* Correct Answers */}
        <div className="space-y-2">
          <h4 className="font-semibold">Correct Answers:</h4>
          <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="font-mono text-sm leading-relaxed">
              {question.data.segments.map((segment) => (
                <span key={segment.id}>
                  {segment.type === 'text' ? (
                    segment.content
                  ) : (
                    <span className="mx-1 inline-block rounded bg-green-200 px-2 py-1 font-semibold dark:bg-green-800">
                      {segment.content}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
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
          {correctCount} out of {totalCount} blanks correct • Score: {score}/{question.points || 0}
        </p>
      </CardContent>
    </Card>
  );
};
