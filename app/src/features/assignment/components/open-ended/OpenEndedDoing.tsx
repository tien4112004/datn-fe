import { useState, useEffect } from 'react';
import type { OpenEndedQuestion, OpenEndedAnswer } from '../../types';
import { MarkdownPreview, DifficultyBadge } from '../shared';

import { AutosizeTextarea } from '@/shared/components/ui/autosize-textarea';
import { QUESTION_TYPE } from '../../types';

interface OpenEndedDoingProps {
  question: OpenEndedQuestion;
  answer?: OpenEndedAnswer;
  points?: number; // Optional points for display
  onAnswerChange: (answer: OpenEndedAnswer) => void;
}

export const OpenEndedDoing = ({ question, answer, points, onAnswerChange }: OpenEndedDoingProps) => {
  const [text, setText] = useState(answer?.text || '');

  useEffect(() => {
    setText(answer?.text || '');
  }, [answer]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // Check max length
    if (question.data.maxLength && value.length > question.data.maxLength) {
      return;
    }

    setText(value);
    onAnswerChange({
      questionId: question.id,
      type: QUESTION_TYPE.OPEN_ENDED,
      text: value,
    });
  };

  const remainingChars = question.data.maxLength ? question.data.maxLength - text.length : null;

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

      {/* Answer Textarea */}
      <div className="space-y-2">
        <AutosizeTextarea
          value={text}
          onChange={handleChange}
          placeholder="Type your answer here..."
          minHeight={150}
          className="font-sans"
        />

        {remainingChars !== null && (
          <p className="text-muted-foreground text-right text-sm">{remainingChars} characters remaining</p>
        )}
      </div>

      {/* Points */}
      {points && <p className="text-muted-foreground text-sm">Points: {points}</p>}
    </div>
  );
};
