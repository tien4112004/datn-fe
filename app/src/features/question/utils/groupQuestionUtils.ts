import { QUESTION_TYPE, type GroupQuestionData, type SubQuestion } from '@aiprimary/core';
import { generateId } from '@/shared/lib/utils';

/**
 * Group Question Utilities
 * Helper functions for working with group questions
 */

/**
 * Validate a group question
 */
export function validateGroupQuestion(data: GroupQuestionData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Must have at least one sub-question
  if (!data.questions || data.questions.length === 0) {
    errors.push('A group question must contain at least one sub-question');
  }

  // Validate each sub-question
  data.questions?.forEach((question, index) => {
    if (!question.title || question.title.trim() === '') {
      errors.push(`Question ${index + 1}: Title is required`);
    }

    // Type-specific validation
    switch (question.type) {
      case QUESTION_TYPE.MULTIPLE_CHOICE: {
        const mcData = question.data as any;
        if (!mcData.options || mcData.options.length < 2) {
          errors.push(`Question ${index + 1}: At least two options are required`);
        }
        const hasCorrect = mcData.options?.some((opt: any) => opt.isCorrect);
        if (!hasCorrect) {
          errors.push(`Question ${index + 1}: At least one correct answer must be selected`);
        }
        break;
      }
      case QUESTION_TYPE.MATCHING: {
        const matchData = question.data as any;
        if (!matchData.pairs || matchData.pairs.length === 0) {
          errors.push(`Question ${index + 1}: At least one matching pair is required`);
        }
        break;
      }
      case QUESTION_TYPE.FILL_IN_BLANK: {
        const fibData = question.data as any;
        if (!fibData.segments || fibData.segments.length === 0) {
          errors.push(`Question ${index + 1}: At least one segment is required`);
        }
        break;
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate total points for a group question
 */
export function calculateTotalPoints(questions: SubQuestion[]): number {
  return questions.reduce((sum, q) => sum + (q.points || 0), 0);
}

/**
 * Shuffle array (for shuffling questions/options)
 * Fisher-Yates shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Check if all answers are complete
 */
export function isAnswersComplete(questions: SubQuestion[], answers: Record<string, any>): boolean {
  return questions.every((q) => {
    const answer = answers[q.id];
    if (answer === undefined || answer === null) return false;
    if (typeof answer === 'string' && answer.trim() === '') return false;
    if (typeof answer === 'object' && Object.keys(answer).length === 0) return false;
    return true;
  });
}

/**
 * Get count of answered questions
 */
export function getAnsweredCount(questions: SubQuestion[], answers: Record<string, any>): number {
  return questions.filter((q) => {
    const answer = answers[q.id];
    if (answer === undefined || answer === null) return false;
    if (typeof answer === 'string' && answer.trim() === '') return false;
    if (typeof answer === 'object' && Object.keys(answer).length === 0) return false;
    return true;
  }).length;
}

/**
 * Auto-grade multiple choice question
 */
export function gradeMultipleChoice(
  questionData: any,
  userAnswer: string
): { correct: boolean; correctAnswerId: string | null } {
  const correctOption = questionData.options?.find((opt: any) => opt.isCorrect);
  return {
    correct: correctOption?.id === userAnswer,
    correctAnswerId: correctOption?.id || null,
  };
}

/**
 * Create empty question data based on type
 */
export function createEmptyQuestionData(type: SubQuestion['type']): any {
  switch (type) {
    case QUESTION_TYPE.MULTIPLE_CHOICE:
      return {
        options: [
          { id: generateId(), text: '', isCorrect: false },
          { id: generateId(), text: '', isCorrect: false },
        ],
        shuffleOptions: false,
      };
    case QUESTION_TYPE.MATCHING:
      return {
        pairs: [{ id: generateId(), left: '', right: '' }],
        shufflePairs: false,
      };
    case QUESTION_TYPE.OPEN_ENDED:
      return {
        expectedAnswer: '',
        maxLength: undefined,
      };
    case QUESTION_TYPE.FILL_IN_BLANK:
      return {
        segments: [],
        caseSensitive: false,
      };
    default:
      return { options: [], shuffleOptions: false };
  }
}

/**
 * Deep clone question data
 */
export function cloneQuestionData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
