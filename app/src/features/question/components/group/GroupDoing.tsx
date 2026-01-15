import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GroupQuestion, Answer } from '@aiprimary/core';
import { VIEW_MODE } from '@/features/assignment/types';
import { SubQuestionList } from './SubQuestionList';

interface GroupDoingProps {
  question: GroupQuestion;
  answer?: Answer;
  points?: number;
  onAnswerChange: (answer: Answer) => void;
}

/**
 * GroupDoing Component
 *
 * DOING view mode for group questions. Interactive mode for students to:
 * - Read group description
 * - Answer all sub-questions
 * - See progress indicator
 */
export function GroupDoing({ question, answer, points, onAnswerChange }: GroupDoingProps) {
  const { t } = useTranslation('questions');
  const [answers, setAnswers] = useState<Record<string, any>>((answer as any)?.subAnswers || {});

  // Handle individual sub-question answer changes
  const handleAnswerChange = (questionId: string, subAnswer: any) => {
    const newAnswers = { ...answers, [questionId]: subAnswer };
    setAnswers(newAnswers);

    // Notify parent with complete answer structure
    onAnswerChange({
      questionId: question.id,
      type: 'group' as any,
      subAnswers: newAnswers,
    } as any);
  };

  return (
    <div className="space-y-6">
      {/* Question Title */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{question.title}</h3>
        {points !== undefined && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t('common.totalPoints')}: {points}
          </p>
        )}
      </div>

      {/* Group Description */}
      {question.data.description && (
        <div
          className="prose dark:prose-invert max-w-none rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
          dangerouslySetInnerHTML={{ __html: question.data.description }}
        />
      )}

      {/* Sub-Questions in Doing Mode */}
      <SubQuestionList
        questions={question.data.questions}
        viewMode={VIEW_MODE.DOING}
        answers={answers}
        showNumbers={question.data.showQuestionNumbers}
        shuffle={question.data.shuffleQuestions}
        onAnswerChange={handleAnswerChange}
      />
    </div>
  );
}
