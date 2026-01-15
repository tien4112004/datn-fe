import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { MultipleChoiceQuestion, MultipleChoiceAnswer } from '@/features/assignment/types';
import { MarkdownPreview } from '../shared';

import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { DifficultyBadge } from '../shared';
import { QUESTION_TYPE } from '@/features/assignment/types';
import { cn } from '@/shared/lib/utils';

interface MultipleChoiceDoingProps {
  question: MultipleChoiceQuestion;
  answer?: MultipleChoiceAnswer;
  points?: number; // Optional points for display
  onAnswerChange: (answer: MultipleChoiceAnswer) => void;
  hideHeader?: boolean; // Hide type label and difficulty badge when used as sub-question
}

export const MultipleChoiceDoing = ({
  question,
  answer,
  points,
  onAnswerChange,
  hideHeader = false,
}: MultipleChoiceDoingProps) => {
  const { t } = useTranslation('questions');
  const [selectedId, setSelectedId] = useState<string>(answer?.selectedOptionId || '');

  useEffect(() => {
    setSelectedId(answer?.selectedOptionId || '');
  }, [answer]);

  const handleSelect = (optionId: string) => {
    setSelectedId(optionId);
    onAnswerChange({
      questionId: question.id,
      type: QUESTION_TYPE.MULTIPLE_CHOICE,
      selectedOptionId: optionId,
    });
  };

  return (
    <div className="space-y-4">
      {/* Question Title */}
      <div className="space-y-2">
        <MarkdownPreview content={question.title} />
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
      </div>

      {/* Options */}
      <RadioGroup value={selectedId} onValueChange={handleSelect}>
        <div className="space-y-2">
          {question.data.options.map((option, index) => (
            <div
              key={option.id}
              className={cn(
                'hover:border-primary/50 flex items-center gap-3 rounded-md border-2 p-3 transition-colors',
                selectedId === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            >
              <RadioGroupItem value={option.id} id={option.id} className="flex-shrink-0" />
              <Label htmlFor={option.id} className="min-w-0 flex-1 cursor-pointer">
                <div className="mb-1 font-medium">{String.fromCharCode(65 + index)}</div>
                <MarkdownPreview content={option.text} />
                {option.imageUrl && (
                  <img
                    src={option.imageUrl}
                    alt={`Option ${String.fromCharCode(65 + index)}`}
                    className="mt-2 max-h-32 rounded-md border"
                  />
                )}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      {/* Points */}
      {points && (
        <p className="text-muted-foreground text-sm">
          {t('common.points')}: {points}
        </p>
      )}
    </div>
  );
};
