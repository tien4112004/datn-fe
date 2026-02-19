import { useTranslation } from 'react-i18next';
import type { MultipleChoiceQuestion } from '@aiprimary/core';
import { MarkdownPreview, QuestionTitle } from '../shared';
import { Label } from '@ui/label';
import { Badge } from '@ui/badge';
import { Shuffle, CheckCircle2 } from 'lucide-react';
import { cn } from '@ui/lib/utils';

interface MultipleChoiceViewingProps {
  question: MultipleChoiceQuestion;
  compact?: boolean;
}

export const MultipleChoiceViewing = ({ question, compact }: MultipleChoiceViewingProps) => {
  const { t } = useTranslation('questions');
  return (
    <div className={cn(compact ? 'space-y-2' : 'space-y-4')}>
      {/* Question Title */}
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

      {/* Options */}
      <div className={cn(compact ? 'space-y-1' : 'space-y-2')}>
        <div className={cn('flex items-center', compact ? 'gap-1' : 'gap-2')}>
          <Label className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {t('multipleChoice.viewing.options')}
          </Label>
          {question.data.shuffleOptions && (
            <Badge variant="secondary" className={cn('flex items-center gap-1', compact && 'py-0 text-xs')}>
              <Shuffle className={cn(compact ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
              {t('multipleChoice.viewing.shuffle')}
            </Badge>
          )}
        </div>
        {question.data.options.map((option, index) => (
          <div
            key={option.id}
            className={cn(
              'flex items-center rounded-md border',
              compact ? 'gap-2 p-1' : 'gap-3 px-3 py-2',
              option.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''
            )}
          >
            <div
              className={cn(
                'flex flex-shrink-0 items-center justify-center rounded-full font-medium',
                compact ? 'h-5 w-5 text-xs' : 'h-6 w-6 text-sm',
                option.isCorrect ? 'bg-green-600 text-white' : 'bg-muted'
              )}
            >
              {String.fromCharCode(65 + index)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <MarkdownPreview content={option.text} />
                {option.isCorrect && (
                  <CheckCircle2
                    className={cn('flex-shrink-0 text-green-600', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')}
                  />
                )}
              </div>
              {option.imageUrl && (
                <img
                  src={option.imageUrl}
                  alt={`Option ${String.fromCharCode(65 + index)}`}
                  className={cn('mt-2 rounded-md border', compact ? 'max-h-16' : 'max-h-32')}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Explanation */}
      {question.explanation && (
        <div
          className={cn(
            'space-y-1 rounded-lg border border-gray-300 bg-blue-50 dark:border-gray-600 dark:bg-blue-900/20',
            compact ? 'p-1.5' : 'space-y-2 p-3'
          )}
        >
          <Label className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {t('multipleChoice.viewing.explanation')}
          </Label>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}
    </div>
  );
};
