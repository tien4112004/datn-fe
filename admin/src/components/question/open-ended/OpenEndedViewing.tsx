import type { OpenEndedQuestion } from '@/types/questionBank';
import { MarkdownPreview, QuestionNumber } from '../shared';
import { Label } from '@/components/ui/label';

interface OpenEndedViewingProps {
  question: OpenEndedQuestion;
  points?: number;
  number?: number;
}

export const OpenEndedViewing = ({ question, points, number }: OpenEndedViewingProps) => {
  return (
    <div className="space-y-4">
      {number !== undefined && (
        <div className="flex items-center gap-3">
          <QuestionNumber number={number} />
        </div>
      )}

      {/* Question */}
      <div className="space-y-1">
        <MarkdownPreview content={question.title} />
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
      </div>

      {/* Character Limit */}
      {question.data.maxLength && (
        <p className="text-muted-foreground text-sm">Maximum {question.data.maxLength} characters</p>
      )}

      {/* Expected Answer */}
      {question.data.expectedAnswer && (
        <div className="space-y-2 rounded-lg border border-gray-300 bg-green-50 p-3 dark:border-gray-600 dark:bg-green-900/20">
          <Label className="text-sm font-medium">Expected Answer</Label>
          <MarkdownPreview content={question.data.expectedAnswer} />
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div className="space-y-2 rounded-lg border border-gray-300 bg-blue-50 p-3 dark:border-gray-600 dark:bg-blue-900/20">
          <Label className="text-sm font-medium">Explanation</Label>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}

      {/* Points */}
      {points && <p className="text-muted-foreground text-sm">Points: {points}</p>}
    </div>
  );
};
