import type { OpenEndedQuestion } from '@/types/questionBank';
import { MarkdownPreview } from '../shared';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface OpenEndedViewingProps {
  question: OpenEndedQuestion;
  compact?: boolean;
}

export const OpenEndedViewing = ({ question, compact }: OpenEndedViewingProps) => {
  return (
    <div className={cn(compact ? 'space-y-2' : 'space-y-4')}>
      {/* Question */}
      <div className="space-y-1">
        <MarkdownPreview content={question.title} />
        {question.titleImageUrl && (
          <img
            src={question.titleImageUrl}
            alt="Question"
            className={cn('mt-2 rounded-md border', compact ? 'max-h-32' : 'max-h-64')}
          />
        )}
      </div>

      {/* Character Limit */}
      {question.data.maxLength && (
        <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
          Maximum {question.data.maxLength} characters
        </p>
      )}

      {/* Expected Answer */}
      {question.data.expectedAnswer && (
        <div
          className={cn(
            'space-y-1 rounded-lg border border-gray-300 bg-green-50 dark:border-gray-600 dark:bg-green-900/20',
            compact ? 'p-2' : 'space-y-2 p-3'
          )}
        >
          <Label className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>Expected Answer</Label>
          <MarkdownPreview content={question.data.expectedAnswer} />
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div
          className={cn(
            'space-y-1 rounded-lg border border-gray-300 bg-blue-50 dark:border-gray-600 dark:bg-blue-900/20',
            compact ? 'p-2' : 'space-y-2 p-3'
          )}
        >
          <Label className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>Explanation</Label>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}
    </div>
  );
};
