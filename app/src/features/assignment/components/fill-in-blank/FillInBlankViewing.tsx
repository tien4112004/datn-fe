import type { FillInBlankQuestion } from '../../types';
import { DifficultyBadge, MarkdownPreview } from '../shared';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';

interface FillInBlankViewingProps {
  question: FillInBlankQuestion;
  points?: number; // Optional points for display
}

export const FillInBlankViewing = ({ question, points }: FillInBlankViewingProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Fill In Blank Question</h3>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>
      {/* Title */}
      {question.title && (
        <div className="space-y-2">
          <p className="font-medium">{question.title}</p>
          {question.titleImageUrl && (
            <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
          )}
        </div>
      )}

      {/* Question with blanks */}
      <div className="bg-muted/50 rounded-md p-4 font-mono text-sm">
        {question.data.segments.map((segment) => (
          <span key={segment.id}>
            {segment.type === 'text' ? (
              segment.content
            ) : (
              <span className="border-primary mx-1 inline-block min-w-[100px] border-b-2 border-dashed px-2">
                _________
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Expected Answers */}
      <div className="space-y-2 rounded-lg border bg-green-50 p-3 dark:bg-green-900/20">
        <Label className="text-sm font-medium">Expected Answers:</Label>
        <div className="space-y-1">
          {question.data.segments
            .filter((segment) => segment.type === 'blank')
            .map((segment, index) => (
              <div key={segment.id} className="flex items-center gap-2">
                <Badge variant="outline">Blank {index + 1}</Badge>
                <code className="bg-background rounded px-2 py-1 text-sm">{segment.content}</code>
              </div>
            ))}
        </div>
      </div>

      {/* Case Sensitivity */}
      {question.data.caseSensitive !== undefined && (
        <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-2">
          <Label className="text-sm font-medium">Case Sensitive</Label>
          <Badge variant={question.data.caseSensitive ? 'default' : 'secondary'} className="ml-auto">
            {question.data.caseSensitive ? 'Yes' : 'No'}
          </Badge>
        </div>
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
