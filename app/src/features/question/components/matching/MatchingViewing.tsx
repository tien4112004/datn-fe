import { useTranslation } from 'react-i18next';
import type { MatchingQuestion } from '@/features/assignment/types';
import { MarkdownPreview, QuestionTitle } from '../shared';
import { Label } from '@ui/label';
import { Badge } from '@ui/badge';
import { Shuffle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface MatchingViewingProps {
  question: MatchingQuestion;
  compact?: boolean;
}

export const MatchingViewing = ({ question, compact }: MatchingViewingProps) => {
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

      {/* Shuffle Pairs Setting */}
      {question.data.shufflePairs && (
        <div className={cn('flex items-center', compact ? 'gap-1' : 'gap-2')}>
          <Label className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {t('matching.viewing.matchingPairs')}
          </Label>
          <Badge variant="secondary" className={cn('flex items-center gap-1', compact && 'py-0 text-xs')}>
            <Shuffle className={cn(compact ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
            {t('matching.viewing.shuffle')}
          </Badge>
        </div>
      )}

      {/* Matching Pairs */}
      <div className={cn('grid grid-cols-1 md:grid-cols-2', compact ? 'gap-2' : 'gap-4')}>
        {/* Left Column */}
        <div className={cn(compact ? 'space-y-1' : 'space-y-1.5')}>
          <h4 className={cn('font-semibold', compact ? 'text-xs' : 'text-sm')}>
            {t('matching.viewing.columnA')}
          </h4>
          {question.data.pairs.map((pair, index) => (
            <div
              key={`left-${pair.id}`}
              className={cn(
                'flex items-center rounded-md border bg-blue-50 dark:bg-blue-900/20',
                compact ? 'gap-2 p-1.5' : 'gap-3 px-3 py-2'
              )}
            >
              <div
                className={cn(
                  'flex flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-medium text-white',
                  compact ? 'h-5 w-5 text-xs' : 'h-6 w-6 text-sm'
                )}
              >
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <MarkdownPreview content={pair.left} />
                {pair.leftImageUrl && (
                  <img
                    src={pair.leftImageUrl}
                    alt={`Left ${index + 1}`}
                    className={cn('mt-2 rounded-md border', compact ? 'max-h-16' : 'max-h-32')}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className={cn(compact ? 'space-y-1' : 'space-y-1.5')}>
          <h4 className={cn('font-semibold', compact ? 'text-xs' : 'text-sm')}>
            {t('matching.viewing.columnB')}
          </h4>
          {question.data.pairs.map((pair, index) => (
            <div
              key={`right-${pair.id}`}
              className={cn(
                'flex items-center rounded-md border bg-green-50 dark:bg-green-900/20',
                compact ? 'gap-2 p-1.5' : 'gap-3 px-3 py-2'
              )}
            >
              <div
                className={cn(
                  'flex flex-shrink-0 items-center justify-center rounded-full bg-green-600 font-medium text-white',
                  compact ? 'h-5 w-5 text-xs' : 'h-6 w-6 text-sm'
                )}
              >
                {String.fromCharCode(65 + index)}
              </div>
              <div className="min-w-0 flex-1">
                <MarkdownPreview content={pair.right} />
                {pair.rightImageUrl && (
                  <img
                    src={pair.rightImageUrl}
                    alt={`Right ${index + 1}`}
                    className={cn('mt-2 rounded-md border', compact ? 'max-h-16' : 'max-h-32')}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      {question.explanation && (
        <div
          className={cn(
            'space-y-1 rounded-lg border border-gray-300 bg-blue-50 dark:border-gray-600 dark:bg-blue-900/20',
            compact ? 'p-2' : 'space-y-2 px-3 py-2'
          )}
        >
          <Label className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {t('matching.viewing.explanation')}
          </Label>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}
    </div>
  );
};
