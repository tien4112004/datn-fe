import type { MultipleChoiceQuestion } from '../../types';
import { MarkdownPreview } from '../shared';

import { DifficultyBadge } from '../shared';

interface MultipleChoiceViewingProps {
  question: MultipleChoiceQuestion;
  points?: number; // Optional points for display
}

export const MultipleChoiceViewing = ({ question, points }: MultipleChoiceViewingProps) => {
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
      <div className="space-y-2">
        {question.data.options.map((option, index) => (
          <div key={option.id} className="flex items-start gap-3 rounded-md border p-3">
            <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
              {String.fromCharCode(65 + index)}
            </div>
            <div className="flex-1">
              <MarkdownPreview content={option.text} />
              {option.imageUrl && (
                <img
                  src={option.imageUrl}
                  alt={`Option ${String.fromCharCode(65 + index)}`}
                  className="mt-2 max-h-32 rounded-md border"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Points */}
      {points && <p className="text-muted-foreground text-sm">Points: {points}</p>}
    </div>
  );
};
