import type { MultipleChoiceQuestion } from '../../types';
import { MarkdownPreview } from '../shared';
import { DifficultyBadge } from '../shared';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Shuffle, CheckCircle2 } from 'lucide-react';

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

      {/* Shuffle Options Setting */}
      {question.data.shuffleOptions !== undefined && (
        <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-2">
          <Shuffle className="h-4 w-4" />
          <Label className="text-sm font-medium">Shuffle Options</Label>
          <Badge variant={question.data.shuffleOptions ? 'default' : 'secondary'} className="ml-auto">
            {question.data.shuffleOptions ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      )}

      {/* Options */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Options:</Label>
        {question.data.options.map((option, index) => (
          <div
            key={option.id}
            className={`flex items-start gap-3 rounded-md border p-3 ${option.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
          >
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${option.isCorrect ? 'bg-green-600 text-white' : 'bg-muted'}`}
            >
              {String.fromCharCode(65 + index)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <MarkdownPreview content={option.text} />
                {option.isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
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
        <div className="space-y-2 rounded-lg border bg-blue-50 p-3 dark:bg-blue-900/20">
          <Label className="text-sm font-medium">Explanation:</Label>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}

      {/* Points */}
      {points && <p className="text-muted-foreground text-sm">Points: {points}</p>}
    </div>
  );
};
