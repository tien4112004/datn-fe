import { useMemo } from 'react';
import type { SubQuestion } from '@aiprimary/core';
import { SubQuestionWrapper } from './SubQuestionWrapper';

type ViewMode = 'editing' | 'viewing';

interface SubQuestionListProps {
  questions: SubQuestion[];
  viewMode: ViewMode;
  showNumbers?: boolean;
  shuffle?: boolean;
  onChange?: (questions: SubQuestion[]) => void;
}

/**
 * SubQuestionList Component (Admin - Simplified)
 *
 * Renders a list of sub-questions with support for:
 * - Question numbering
 * - Question shuffling
 * - Only EDITING and VIEWING modes
 */
export function SubQuestionList({
  questions,
  viewMode,
  showNumbers = true,
  shuffle = false,
  onChange,
}: SubQuestionListProps) {
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

  // Handle question updates (for editing mode)
  const handleQuestionChange = (index: number) => (updated: SubQuestion) => {
    if (onChange) {
      const newQuestions = [...questions];
      newQuestions[index] = updated;
      onChange(newQuestions);
    }
  };

  return (
    <div className="space-y-6">
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
                points={question.points}
                onChange={handleQuestionChange(originalIndex)}
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
          <p>No sub-questions yet</p>
          {viewMode === 'editing' && (
            <p className="mt-1 text-sm">Click "Add Question" above to add a sub-question</p>
          )}
        </div>
      )}
    </div>
  );
}
