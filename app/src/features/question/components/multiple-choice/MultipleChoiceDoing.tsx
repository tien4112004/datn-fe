import { useState, useEffect } from 'react';
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
}

export const MultipleChoiceDoing = ({
  question,
  answer,
  points,
  onAnswerChange,
}: MultipleChoiceDoingProps) => {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Multiple Choice Question</h3>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </div>

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
                'flex items-start gap-3 rounded-md border p-3 transition-colors',
                selectedId === option.id && 'bg-primary/5 border-primary'
              )}
            >
              <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
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
      {points && <p className="text-muted-foreground text-sm">Points: {points}</p>}
    </div>
  );
};
