import { useState, useEffect } from 'react';
import type { MultipleChoiceQuestion, MultipleChoiceAnswer } from '@/features/assignment/types';
import { MarkdownPreview, QuestionTitle } from '../shared';

import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { QUESTION_TYPE } from '@/features/assignment/types';
import { cn } from '@/shared/lib/utils';

interface MultipleChoiceDoingProps {
  question: MultipleChoiceQuestion;
  answer?: MultipleChoiceAnswer;
  onAnswerChange: (answer: MultipleChoiceAnswer) => void;
}

export const MultipleChoiceDoing = ({ question, answer, onAnswerChange }: MultipleChoiceDoingProps) => {
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
        <QuestionTitle content={question.title} />
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
                'hover:border-primary/50 flex items-center gap-3 rounded-md border-2 px-3 py-2 transition-colors',
                selectedId === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            >
              <RadioGroupItem value={option.id} id={option.id} className="flex-shrink-0" />
              <Label htmlFor={option.id} className="min-w-0 flex-1 cursor-pointer">
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
    </div>
  );
};
