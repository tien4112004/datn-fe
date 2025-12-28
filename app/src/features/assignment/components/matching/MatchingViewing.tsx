import type { MatchingQuestion } from '../../types';
import { MarkdownPreview, DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface MatchingViewingProps {
  question: MatchingQuestion;
}

export const MatchingViewing = ({ question }: MatchingViewingProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Matching Question</CardTitle>
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

        {/* Matching Pairs */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-2">
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
          <div className="space-y-2">
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

        {/* Points */}
        {question.points && <p className="text-muted-foreground text-sm">Points: {question.points}</p>}
      </CardContent>
    </Card>
  );
};
