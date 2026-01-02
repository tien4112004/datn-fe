import type { MultipleChoiceQuestion } from '../../types';
import { MarkdownPreview } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DifficultyBadge } from '../shared';

interface MultipleChoiceViewingProps {
  question: MultipleChoiceQuestion;
}

export const MultipleChoiceViewing = ({ question }: MultipleChoiceViewingProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Multiple Choice Question</CardTitle>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
        {question.points && <p className="text-muted-foreground text-sm">Points: {question.points}</p>}
      </CardContent>
    </Card>
  );
};
