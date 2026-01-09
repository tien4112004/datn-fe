import { useState, useEffect } from 'react';
import type { FillInBlankQuestion, FillInBlankAnswer } from '../../types';
import { DifficultyBadge } from '../shared';
import { Input } from '@/shared/components/ui/input';
import { QUESTION_TYPE } from '../../types';

interface FillInBlankDoingProps {
  question: FillInBlankQuestion;
  answer?: FillInBlankAnswer;
  points?: number; // Optional points for display
  onAnswerChange: (answer: FillInBlankAnswer) => void;
}

export const FillInBlankDoing = ({ question, answer, points, onAnswerChange }: FillInBlankDoingProps) => {
  const blankSegments = question.data.segments.filter((s) => s.type === 'blank');
  const [blanks, setBlanks] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    answer?.blanks.forEach((b) => {
      initial[b.segmentId] = b.value;
    });
    return initial;
  });

  useEffect(() => {
    const initial: Record<string, string> = {};
    answer?.blanks.forEach((b) => {
      initial[b.segmentId] = b.value;
    });
    setBlanks(initial);
  }, [answer]);

  const handleBlankChange = (segmentId: string, value: string) => {
    const updated = { ...blanks, [segmentId]: value };
    setBlanks(updated);

    onAnswerChange({
      questionId: question.id,
      type: QUESTION_TYPE.FILL_IN_BLANK,
      blanks: Object.entries(updated).map(([segmentId, value]) => ({
        segmentId,
        value,
      })),
    });
  };

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

      {/* Question with input blanks */}
      <div className="bg-muted/50 rounded-md p-4 text-sm leading-relaxed">
        {question.data.segments.map((segment) => (
          <span key={segment.id}>
            {segment.type === 'text' ? (
              <span className="font-mono">{segment.content}</span>
            ) : (
              <Input
                type="text"
                value={blanks[segment.id] || ''}
                onChange={(e) => handleBlankChange(segment.id, e.target.value)}
                className="mx-1 inline-block h-8 w-32 text-center font-mono"
                placeholder={`Blank ${blankSegments.findIndex((s) => s.id === segment.id) + 1}`}
              />
            )}
          </span>
        ))}
      </div>

      {/* Info */}
      <div className="text-muted-foreground space-y-1 text-sm">
        {question.data.caseSensitive && (
          <p className="text-amber-600 dark:text-amber-400">⚠️ Answers are case-sensitive</p>
        )}
        {points && <p>Points: {points}</p>}
      </div>
    </div>
  );
};
