import { generateId } from '@/shared/lib/utils';
import type { Question, QuestionType, Difficulty } from '../types';
import { QUESTION_TYPE, DIFFICULTY } from '../types';
import { questionSchema } from '../types/validation';

export const createEmptyQuestion = (
  type: QuestionType,
  difficulty: Difficulty = DIFFICULTY.EASY
): Question => {
  const baseId = generateId();

  switch (type) {
    case QUESTION_TYPE.MULTIPLE_CHOICE:
      return {
        id: baseId,
        type,
        difficulty,
        title: '',
        explanation: '',
        points: 10,
        options: [
          { id: generateId(), text: '', isCorrect: true },
          { id: generateId(), text: '', isCorrect: false },
        ],
      };

    case QUESTION_TYPE.MATCHING:
      return {
        id: baseId,
        type,
        difficulty,
        title: '',
        explanation: '',
        points: 10,
        pairs: [
          { id: generateId(), left: '', right: '' },
          { id: generateId(), left: '', right: '' },
        ],
      };

    case QUESTION_TYPE.OPEN_ENDED:
      return {
        id: baseId,
        type,
        difficulty,
        title: '',
        explanation: '',
        expectedAnswer: '',
        maxLength: 500,
        points: 10,
      };

    case QUESTION_TYPE.FILL_IN_BLANK:
      return {
        id: baseId,
        type,
        difficulty,
        title: '',
        explanation: '',
        points: 10,
        segments: [
          { id: generateId(), type: 'text', content: '' },
          { id: generateId(), type: 'blank', content: '' },
        ],
        caseSensitive: false,
      };

    default:
      throw new Error(`Unknown question type: ${type}`);
  }
};

export const validateQuestion = (question: Question): { valid: boolean; errors?: string[] } => {
  try {
    questionSchema.parse(question);
    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      errors: error.errors?.map((e: any) => e.message) || ['Validation failed'],
    };
  }
};

export const duplicateQuestion = (question: Question): Question => {
  return {
    ...JSON.parse(JSON.stringify(question)),
    id: generateId(),
  };
};
