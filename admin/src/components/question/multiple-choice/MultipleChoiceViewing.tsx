import type { MultipleChoiceQuestion } from '@/types/questionBank';
import { MarkdownPreview, QuestionNumber } from '../shared';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shuffle, CheckCircle2 } from 'lucide-react';

interface MultipleChoiceViewingProps {
  question: MultipleChoiceQuestion;
  points?: number;
  number?: number;
}

export const MultipleChoiceViewing = ({ question, points, number }: MultipleChoiceViewingProps) => {
  return (
    <div className="space-y-4">
      {number !== undefined && (
        <div className="flex items-center gap-3">
          <QuestionNumber number={number} />
        </div>
      )}

      {/* Question Title */}
      <div className="space-y-1">
        <MarkdownPreview content={question.title} />
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Options</Label>
          {question.data.shuffleOptions && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shuffle className="h-3 w-3" />
              Shuffled
            </Badge>
          )}
        </div>
        {question.data.options.map((option, index) => (
          <div
            key={option.id}
            className={`flex items-center gap-3 rounded-md border p-3 ${option.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
          >
            <div
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium ${option.isCorrect ? 'bg-green-600 text-white' : 'bg-muted'}`}
            >
              {String.fromCharCode(65 + index)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <MarkdownPreview content={option.text} />
                {option.isCorrect && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />}
              </div>
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

      {/* Explanation */}
      {question.explanation && (
        <div className="space-y-2 rounded-lg border border-gray-300 bg-blue-50 p-3 dark:border-gray-600 dark:bg-blue-900/20">
          <Label className="text-sm font-medium">Explanation</Label>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}

      {/* Points */}
      {points && <p className="text-muted-foreground text-sm">Points: {points}</p>}
    </div>
  );
};
