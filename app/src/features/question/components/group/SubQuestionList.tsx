import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SubQuestion } from '@aiprimary/core';
import type { ViewMode } from '@/features/assignment/types';
import { SubQuestionWrapper } from './SubQuestionWrapper';

interface SubQuestionListProps {
  questions: SubQuestion[];
  viewMode: ViewMode;
  answers?: Record<string, any>;
  showNumbers?: boolean;
  shuffle?: boolean;
  onAnswerChange?: (questionId: string, answer: any) => void;
  onChange?: (questions: SubQuestion[]) => void;
  onGradeChange?: (questionId: string, grade: { points: number; feedback?: string }) => void;
}

/**
 * SubQuestionList Component
 *
 * Renders a list of sub-questions with support for:
 * - Progress tracking (in DOING mode)
 * - Question numbering
 * - Question shuffling
 * - Answer collection
 */
export function SubQuestionList({
  questions,
  viewMode,
  answers = {},
  showNumbers = true,
  shuffle = false,
  onAnswerChange,
  onChange,
  onGradeChange,
}: SubQuestionListProps) {
  const { t } = useTranslation('questions');

  // Apply shuffling if enabled
  const displayQuestions = useMemo(() => {
    if (!shuffle) return questions;
    // Create a copy and shuffle using Fisher-Yates algorithm
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [questions, shuffle]);

  // Calculate progress
  const getAnsweredCount = () => {
    return questions.filter((q) => {
      const answer = answers[q.id];
      if (answer === undefined || answer === null) return false;
      if (typeof answer === 'string' && answer.trim() === '') return false;
      if (typeof answer === 'object' && Object.keys(answer).length === 0) return false;
      return true;
    }).length;
  };

  // Handle answer changes for individual sub-questions
  const handleAnswerChange = (questionId: string) => (answer: any) => {
    if (onAnswerChange) {
      onAnswerChange(questionId, answer);
    }
  };

  // Handle question updates (for editing mode)
  const handleQuestionChange = (index: number) => (updated: SubQuestion) => {
    if (onChange) {
      const newQuestions = [...questions];
      newQuestions[index] = updated;
      onChange(newQuestions);
    }
  };

  // Handle grading changes
  const handleGradeChange = (questionId: string) => (grade: { points: number; feedback?: string }) => {
    if (onGradeChange) {
      onGradeChange(questionId, grade);
    }
  };

  // Show progress indicator only in DOING mode
  const showProgress = viewMode === 'doing';

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      {showProgress && questions.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('group.subQuestion.progress')}
          </span>
          <span className="text-sm">
            <span className="font-bold text-blue-600 dark:text-blue-400">{getAnsweredCount()}</span>
            {' / '}
            <span className="text-gray-600 dark:text-gray-400">{questions.length}</span>
            {t('group.subQuestion.questionsAnswered')}
          </span>
        </div>
      )}

      {/* Sub-Questions */}
      <div className="space-y-6">
        {displayQuestions.map((question, index) => {
          // Find original index for consistent ordering in onChange
          const originalIndex = questions.findIndex((q) => q.id === question.id);

          return (
            <div
              key={question.id}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <SubQuestionWrapper
                question={question}
                viewMode={viewMode}
                answer={answers[question.id]}
                points={question.points}
                onChange={handleQuestionChange(originalIndex)}
                onAnswerChange={handleAnswerChange(question.id)}
                onGradeChange={handleGradeChange(question.id)}
                index={index}
                showNumber={showNumbers}
              />
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {questions.length === 0 && (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          <p>{t('group.subQuestion.emptyStateTitle')}</p>
          {viewMode === 'editing' && (
            <p className="mt-1 text-sm">{t('group.subQuestion.emptyStateMessage')}</p>
          )}
        </div>
      )}
    </div>
  );
}
