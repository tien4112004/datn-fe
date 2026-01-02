import type { OpenEndedQuestion, OpenEndedAnswer } from '../../types';
import { MarkdownPreview, DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

interface OpenEndedAfterAssessmentProps {
  question: OpenEndedQuestion;
  answer?: OpenEndedAnswer;
}

export const OpenEndedAfterAssessment = ({ question, answer }: OpenEndedAfterAssessmentProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Open-ended Question</CardTitle>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question */}
        <div className="space-y-2">
          <MarkdownPreview content={question.title} />
          {question.titleImageUrl && (
            <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
          )}
        </div>

        {/* Student Answer */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">Your Answer:</h4>
            <Badge variant="outline">Submitted</Badge>
          </div>
          <div className="bg-muted/50 rounded-md p-4">
            {answer?.text ? (
              <p className="whitespace-pre-wrap">{answer.text}</p>
            ) : (
              <p className="text-muted-foreground italic">No answer provided</p>
            )}
          </div>
        </div>

        {/* Expected Answer (if provided) */}
        {question.data.expectedAnswer && (
          <div className="space-y-2">
            <h4 className="font-semibold">Expected Answer:</h4>
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <MarkdownPreview content={question.data.expectedAnswer} />
            </div>
          </div>
        )}

        {/* Explanation */}
        {question.explanation && (
          <div className="bg-muted/50 rounded-md p-4">
            <h4 className="mb-2 font-semibold">Explanation:</h4>
            <MarkdownPreview content={question.explanation} />
          </div>
        )}

        {/* Note about manual grading */}
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Note:</strong> Open-ended questions require manual grading by the instructor.
          </p>
        </div>

        {/* Points */}
        {question.points && (
          <p className="text-muted-foreground text-sm">Points: Pending grading (Max: {question.points})</p>
        )}
      </CardContent>
    </Card>
  );
};
