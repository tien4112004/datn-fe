import type { FillInBlankQuestion } from '../../types';
import { DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface FillInBlankViewingProps {
  question: FillInBlankQuestion;
}

export const FillInBlankViewing = ({ question }: FillInBlankViewingProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Fill In Blank Question</CardTitle>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
          {question.points && <p>Points: {question.points}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
