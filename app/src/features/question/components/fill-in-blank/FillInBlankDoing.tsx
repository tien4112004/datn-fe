import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { FillInBlankQuestion, FillInBlankAnswer } from '@/features/assignment/types';
import { QUESTION_TYPE } from '@/features/assignment/types';
import { Input } from '@/shared/components/ui/input';

interface FillInBlankDoingProps {
  question: FillInBlankQuestion;
  answer?: FillInBlankAnswer;
  points?: number; // Optional points for display
  onAnswerChange: (answer: FillInBlankAnswer) => void;
}

export const FillInBlankDoing = ({ question, answer, points, onAnswerChange }: FillInBlankDoingProps) => {
  const { t } = useTranslation('questions');
  const blankSegments = question.data.segments.filter((s) => s.type === 'blank');
  const [blanks, setBlanks] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    answer?.blanks.forEach((b) => {
      initial[b.segmentId] = b.value;
    });
    return initial;
  });

  useEffect(() => {
    const initial: Record<string, string> = {};
    answer?.blanks.forEach((b) => {
      initial[b.segmentId] = b.value;
    });
    setBlanks(initial);
  }, [answer]);

  const handleBlankChange = (segmentId: string, value: string) => {
    const updated = { ...blanks, [segmentId]: value };
    setBlanks(updated);

    onAnswerChange({
      questionId: question.id,
      type: QUESTION_TYPE.FILL_IN_BLANK,
      blanks: Object.entries(updated).map(([segmentId, value]) => ({
        segmentId,
        value,
      })),
    });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      {question.title && (
        <div className="space-y-2">
          <p className="font-medium">{question.title}</p>
          {question.titleImageUrl && (
            <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
          )}
        </div>
      )}

      {/* Question with input blanks */}
      <div className="rounded-md border border-gray-300 bg-white p-4 text-sm leading-relaxed dark:border-gray-600 dark:bg-gray-800">
        {question.data.segments.map((segment) => (
          <span key={segment.id}>
            {segment.type === 'text' ? (
              <span className="font-mono">{segment.content}</span>
            ) : (
              <Input
                type="text"
                value={blanks[segment.id] || ''}
                onChange={(e) => handleBlankChange(segment.id, e.target.value)}
                className="border-primary/30 focus:border-primary mx-1 inline-block h-9 w-36 border-2 text-center font-mono"
                placeholder={t('fillInBlank.doing.blankPlaceholder', {
                  number: blankSegments.findIndex((s) => s.id === segment.id) + 1,
                })}
              />
            )}
          </span>
        ))}
      </div>

      {/* Info */}
      <div className="text-muted-foreground space-y-1 text-sm">
        {question.data.caseSensitive && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            {t('fillInBlank.doing.caseSensitiveWarning')}
          </div>
        )}
        {points && (
          <p>
            {t('common.points')}: {points}
          </p>
        )}
      </div>
    </div>
  );
};
