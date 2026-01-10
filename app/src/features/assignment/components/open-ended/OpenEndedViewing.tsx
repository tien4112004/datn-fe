import type { OpenEndedQuestion } from '../../types';
import { MarkdownPreview, DifficultyBadge } from '../shared';
import { Label } from '@/shared/components/ui/label';

interface OpenEndedViewingProps {
  question: OpenEndedQuestion;
  points?: number; // Optional points for display
}

export const OpenEndedViewing = ({ question, points }: OpenEndedViewingProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Open-ended Question</h3>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-2">
        <MarkdownPreview content={question.title} />
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
      </div>

      {/* Character Limit */}
      {question.data.maxLength && (
        <p className="text-muted-foreground text-sm">Maximum length: {question.data.maxLength} characters</p>
      )}

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
