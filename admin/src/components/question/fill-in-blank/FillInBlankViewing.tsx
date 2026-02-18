import type { FillInBlankQuestion } from '@/types/questionBank';
import { MarkdownPreview } from '../shared';
import { Label } from '@ui/label';
import { Badge } from '@ui/badge';
import { cn } from '@/lib/utils';

interface FillInBlankViewingProps {
  question: FillInBlankQuestion;
  compact?: boolean;
}

export const FillInBlankViewing = ({ question, compact }: FillInBlankViewingProps) => {
  return (
    <div className={cn(compact ? 'space-y-2' : 'space-y-4')}>
      {/* Title */}
      {question.title && (
        <div className="space-y-1">
          <p className={cn('font-medium', compact && 'text-sm')}>{question.title}</p>
          {question.titleImageUrl && (
            <img
              src={question.titleImageUrl}
              alt="Question"
              className={cn('mt-2 rounded-md border', compact ? 'max-h-32' : 'max-h-64')}
            />
          )}
        </div>
      )}

      {/* Question with blanks */}
      <div
        className={cn(
          'bg-muted/50 rounded-md border border-gray-300 font-mono dark:border-gray-600',
          compact ? 'p-2 text-xs' : 'p-4 text-sm'
        )}
      >
        {question.data.segments.map((segment) => (
          <span key={segment.id}>
            {segment.type === 'text' ? (
              segment.content
            ) : (
              <span
                className={cn(
                  'border-primary mx-1 inline-block border-b-2 border-dashed px-2',
                  compact ? 'min-w-[60px]' : 'min-w-[100px]'
                )}
              >
                _________
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Expected Answers */}
      <div
        className={cn(
          'rounded-lg border border-gray-300 bg-green-50 dark:border-gray-600 dark:bg-green-900/20',
          compact ? 'space-y-1 p-2' : 'space-y-2 p-3'
        )}
      >
        <Label className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>Expected Answers</Label>
        <div className="space-y-1">
          {question.data.segments
            .filter((segment) => segment.type === 'blank')
            .map((segment, index) => (
              <div key={segment.id} className={cn('flex items-center', compact ? 'gap-1' : 'gap-2')}>
                <Badge variant="outline" className={compact ? 'py-0 text-xs' : undefined}>
                  Blank {index + 1}
                </Badge>
                <code className={cn('bg-background rounded px-2 py-1', compact ? 'text-xs' : 'text-sm')}>
                  {segment.content}
                </code>
              </div>
            ))}
        </div>
      </div>

      {/* Case Sensitivity */}
      {question.data.caseSensitive && (
        <div
          className={cn(
            'rounded-md border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200',
            compact ? 'p-1.5 text-[10px]' : 'p-2 text-xs'
          )}
        >
          Answers are case-sensitive
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
