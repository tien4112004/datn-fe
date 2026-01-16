import type { Question, Answer } from '../types';

/**
 * Validate question collection
 * Ensures at least 1 question exists and no duplicate IDs
 */
export const validateQuestionCollection = (questions: Question[]): { valid: boolean; error?: string } => {
  if (questions.length === 0) {
    return { valid: false, error: 'At least one question is required' };
  }

  const ids = questions.map((q) => q.id || '');
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    return { valid: false, error: 'Duplicate question IDs found' };
  }

  return { valid: true };
};

/**
 * Get answer statistics
 * Returns the number of answered questions and total questions
 */
export const getAnswerStats = (
  questions: Question[],
  answers: Map<string, Answer>
): { answered: number; total: number } => {
  const answered = questions.filter((q) => answers.has(q.id)).length;
  return { answered, total: questions.length };
};
