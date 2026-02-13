import { useTranslation } from 'react-i18next';
import type { FillInBlankQuestion } from '@/features/assignment/types';
import { ExplanationSection, QuestionTitle } from '../shared';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

interface FillInBlankViewingProps {
  question: FillInBlankQuestion;
  compact?: boolean;
}

export const FillInBlankViewing = ({ question, compact }: FillInBlankViewingProps) => {
  const { t } = useTranslation('questions');
  return (
    <div className={cn(compact ? 'space-y-2' : 'space-y-4')}>
      {/* Title */}
      {question.title && (
        <div className="space-y-1">
          <QuestionTitle content={question.title} variant="plain" className={compact ? 'text-sm' : ''} />
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
          'bg-muted/50 border-muted rounded-md border font-mono',
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
          'border-muted rounded-lg border bg-green-50 dark:bg-green-900/20',
          compact ? 'space-y-1 p-2' : 'space-y-2 p-3'
        )}
      >
        <Label className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
          {t('fillInBlank.viewing.expectedAnswers')}
        </Label>
        <div className="space-y-1">
          {question.data.segments
            .filter((segment) => segment.type === 'blank')
            .map((segment, index) => (
              <div key={segment.id} className={cn('flex items-center', compact ? 'gap-1' : 'gap-2')}>
                <Badge variant="outline" className={compact ? 'py-0 text-xs' : undefined}>
                  {t('fillInBlank.viewing.blankLabel', { index: index + 1 })}
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
          {t('fillInBlank.viewing.caseSensitiveWarning')}
        </div>
      )}

      {/* Explanation */}
      <ExplanationSection mode="viewing" explanation={question.explanation} compact={compact} />
    </div>
  );
};
