import type { MatchingQuestion } from '@/types/questionBank';
import { MarkdownPreview, QuestionNumber } from '../shared';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shuffle } from 'lucide-react';

interface MatchingViewingProps {
  question: MatchingQuestion;
  points?: number;
  number?: number;
}

export const MatchingViewing = ({ question, points, number }: MatchingViewingProps) => {
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

      {/* Shuffle Pairs Setting */}
      {question.data.shufflePairs && (
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Matching Pairs</Label>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shuffle className="h-3 w-3" />
            Shuffled
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
              className="flex items-center gap-3 rounded-md border bg-blue-50 p-3 dark:bg-blue-900/20"
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
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
              className="flex items-center gap-3 rounded-md border bg-green-50 p-3 dark:bg-green-900/20"
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-medium text-white">
                {String.fromCharCode(65 + index)}
              </div>
              <div className="min-w-0 flex-1">
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
          <Label className="text-sm font-medium">Explanation</Label>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}

      {/* Points */}
      {points && <p className="text-muted-foreground text-sm">Points: {points}</p>}
    </div>
  );
};
