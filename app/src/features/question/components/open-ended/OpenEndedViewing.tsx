import { useTranslation } from 'react-i18next';
import type { OpenEndedQuestion } from '@/features/assignment/types';
import { MarkdownPreview, QuestionNumber } from '../shared';
import { Label } from '@/shared/components/ui/label';

interface OpenEndedViewingProps {
  question: OpenEndedQuestion;
  points?: number; // Optional points for display
  number?: number;
}

export const OpenEndedViewing = ({ question, points, number }: OpenEndedViewingProps) => {
  const { t } = useTranslation('questions');
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
        <p className="text-muted-foreground text-sm">
          {t('openEnded.viewing.maxLength', { maxLength: question.data.maxLength })}
        </p>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div className="space-y-2 rounded-lg border border-gray-300 bg-blue-50 p-3 dark:border-gray-600 dark:bg-blue-900/20">
          <Label className="text-sm font-medium">{t('openEnded.viewing.explanation')}</Label>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}

      {/* Points */}
      {points && <p className="text-muted-foreground text-sm">{t('openEnded.viewing.points', { points })}</p>}
    </div>
  );
};
