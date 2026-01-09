import type { FillInBlankQuestion } from '../../types';
import { DifficultyBadge } from '../shared';

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

      {/* Info */}
      <div className="text-muted-foreground space-y-1 text-sm">
        {question.data.caseSensitive && <p>Note: Answers are case-sensitive</p>}
        {points && <p>Points: {points}</p>}
      </div>
    </div>
  );
};
