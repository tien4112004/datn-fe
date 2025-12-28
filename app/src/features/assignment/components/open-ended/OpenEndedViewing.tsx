import type { OpenEndedQuestion } from '../../types';
import { MarkdownPreview, DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface OpenEndedViewingProps {
  question: OpenEndedQuestion;
}

export const OpenEndedViewing = ({ question }: OpenEndedViewingProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Open-ended Question</CardTitle>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question */}
        <div className="space-y-2">
          <MarkdownPreview content={question.title} />
          {question.titleImageUrl && (
            <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
          )}
        </div>

        {/* Character Limit */}
        {question.data.maxLength && (
          <p className="text-muted-foreground text-sm">
            Maximum length: {question.data.maxLength} characters
          </p>
        )}

        {/* Points */}
        {question.points && <p className="text-muted-foreground text-sm">Points: {question.points}</p>}
      </CardContent>
    </Card>
  );
};
