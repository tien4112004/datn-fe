import { useTranslation } from 'react-i18next';
import type { OpenEndedQuestion } from '@/features/assignment/types';
import { MarkdownPreview, QuestionTitle } from '../shared';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';

interface OpenEndedViewingProps {
  question: OpenEndedQuestion;
  compact?: boolean;
}

export const OpenEndedViewing = ({ question, compact }: OpenEndedViewingProps) => {
  const { t } = useTranslation('questions');
  return (
    <div className={cn(compact ? 'space-y-2' : 'space-y-4')}>
      {/* Question */}
      <div className="space-y-1">
        <QuestionTitle content={question.title} />
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
          {t('openEnded.viewing.maxLength', { maxLength: question.data.maxLength })}
        </p>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div
          className={cn(
            'space-y-1 rounded-lg border border-gray-300 bg-blue-50 dark:border-gray-600 dark:bg-blue-900/20',
            compact ? 'p-2' : 'space-y-2 p-3'
          )}
        >
          <Label className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {t('openEnded.viewing.explanation')}
          </Label>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}
    </div>
  );
};
