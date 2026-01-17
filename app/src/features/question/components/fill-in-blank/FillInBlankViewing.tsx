import { useTranslation } from 'react-i18next';
import type { FillInBlankQuestion } from '@/features/assignment/types';
import { MarkdownPreview } from '../shared';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';

interface FillInBlankViewingProps {
  question: FillInBlankQuestion;
  points?: number; // Optional points for display
}

export const FillInBlankViewing = ({ question, points }: FillInBlankViewingProps) => {
  const { t } = useTranslation('questions');
  return (
    <div className="space-y-2">
      {/* Title */}
      {question.title && (
        <div className="space-y-1">
          <p className="font-medium">{question.title}</p>
          {question.titleImageUrl && (
            <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
          )}
        </div>
      )}

      {/* Question with blanks */}
      <div className="bg-muted/50 rounded-md border border-gray-300 p-4 font-mono text-sm dark:border-gray-600">
        {question.data.segments.map((segment) => (
          <span key={segment.id}>
            {segment.type === 'text' ? (
              segment.content
            ) : (
              <span className="border-primary mx-1 inline-block min-w-[100px] border-b-2 border-dashed px-2">
                _________
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Expected Answers */}
      <div className="space-y-2 rounded-lg border border-gray-300 bg-green-50 p-3 dark:border-gray-600 dark:bg-green-900/20">
        <Label className="text-sm font-medium">{t('fillInBlank.viewing.expectedAnswers')}</Label>
        <div className="space-y-1">
          {question.data.segments
            .filter((segment) => segment.type === 'blank')
            .map((segment, index) => (
              <div key={segment.id} className="flex items-center gap-2">
                <Badge variant="outline">{t('fillInBlank.viewing.blankLabel', { index: index + 1 })}</Badge>
                <code className="bg-background rounded px-2 py-1 text-sm">{segment.content}</code>
              </div>
            ))}
        </div>
      </div>

      {/* Case Sensitivity */}
      {question.data.caseSensitive && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          {t('fillInBlank.viewing.caseSensitiveWarning')}
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div className="space-y-2 rounded-lg border border-gray-300 bg-blue-50 p-3 dark:border-gray-600 dark:bg-blue-900/20">
          <Label className="text-sm font-medium">{t('fillInBlank.viewing.explanation')}</Label>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}

      {/* Points */}
      {points && (
        <p className="text-muted-foreground text-sm">{t('fillInBlank.viewing.points', { points })}</p>
      )}
    </div>
  );
};
