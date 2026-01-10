import type { MatchingQuestion } from '@/features/assignment/types';
import { MarkdownPreview, DifficultyBadge } from '../shared';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Shuffle } from 'lucide-react';

interface MatchingViewingProps {
  question: MatchingQuestion;
  points?: number; // Optional points for display
}

export const MatchingViewing = ({ question, points }: MatchingViewingProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Matching Question</h3>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </div>

      {/* Question Title */}
      <div className="space-y-1">
        <MarkdownPreview content={question.title} />
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
      </div>

      {/* Shuffle Pairs Setting */}
      {question.data.shufflePairs !== undefined && (
        <div className="bg-muted/50 flex items-center gap-2 rounded-lg border border-gray-300 p-2 dark:border-gray-600">
          <Shuffle className="h-4 w-4" />
          <Label className="text-sm font-medium">Shuffle Pairs</Label>
          <Badge variant={question.data.shufflePairs ? 'default' : 'secondary'} className="ml-auto">
            {question.data.shufflePairs ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      )}

      {/* Matching Pairs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-semibold">Column A</h4>
          {question.data.pairs.map((pair, index) => (
            <div
              key={`left-${pair.id}`}
              className="flex items-start gap-3 rounded-md border bg-blue-50 p-3 dark:bg-blue-900/20"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                {index + 1}
              </div>
              <div className="flex-1">
                <MarkdownPreview content={pair.left} />
                {pair.leftImageUrl && (
                  <img
                    src={pair.leftImageUrl}
                    alt={`Left ${index + 1}`}
                    className="mt-2 max-h-32 rounded-md border"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-semibold">Column B</h4>
          {question.data.pairs.map((pair, index) => (
            <div
              key={`right-${pair.id}`}
              className="flex items-start gap-3 rounded-md border bg-green-50 p-3 dark:bg-green-900/20"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-sm font-medium text-white">
                {String.fromCharCode(65 + index)}
              </div>
              <div className="flex-1">
                <MarkdownPreview content={pair.right} />
                {pair.rightImageUrl && (
                  <img
                    src={pair.rightImageUrl}
                    alt={`Right ${index + 1}`}
                    className="mt-2 max-h-32 rounded-md border"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      {question.explanation && (
        <div className="space-y-2 rounded-lg border border-gray-300 bg-blue-50 p-3 dark:border-gray-600 dark:bg-blue-900/20">
          <Label className="text-sm font-medium">Explanation:</Label>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}

      {/* Points */}
      {points && <p className="text-muted-foreground text-sm">Points: {points}</p>}
    </div>
  );
};
