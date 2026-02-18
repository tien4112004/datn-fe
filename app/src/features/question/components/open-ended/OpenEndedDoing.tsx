import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { OpenEndedQuestion, OpenEndedAnswer } from '@/features/assignment/types';
import { QuestionTitle } from '../shared';

import { AutosizeTextarea } from '@ui/autosize-textarea';
import { QUESTION_TYPE } from '@/features/assignment/types';

interface OpenEndedDoingProps {
  question: OpenEndedQuestion;
  answer?: OpenEndedAnswer;
  onAnswerChange: (answer: OpenEndedAnswer) => void;
}

export const OpenEndedDoing = ({ question, answer, onAnswerChange }: OpenEndedDoingProps) => {
  const { t } = useTranslation('questions');
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
      {/* Question */}
      <div className="space-y-2">
        <QuestionTitle content={question.title} />
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
      </div>

      {/* Answer Textarea */}
      <div className="space-y-2">
        <AutosizeTextarea
          value={text}
          onChange={handleChange}
          placeholder={t('openEnded.doing.placeholder')}
          minHeight={150}
          className="focus:border-primary border-2 border-gray-300 font-sans dark:border-gray-600"
        />

        {remainingChars !== null && (
          <p className="text-muted-foreground text-right text-sm">
            {t('common.characterRemaining', { count: remainingChars })}
          </p>
        )}
      </div>
    </div>
  );
};
