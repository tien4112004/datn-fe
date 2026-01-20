import { generateId } from '@/shared/lib/utils';
import type { Question, QuestionType, Difficulty } from '../types';
import { QUESTION_TYPE, DIFFICULTY } from '../types';
import { questionSchema } from '../types/validation';

export const createEmptyQuestion = (
  type: QuestionType,
  difficulty: Difficulty = DIFFICULTY.KNOWLEDGE
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

        data: {
          options: [
            { id: generateId(), text: '', isCorrect: true },
            { id: generateId(), text: '', isCorrect: false },
          ],
        },
      };

    case QUESTION_TYPE.MATCHING:
      return {
        id: baseId,
        type,
        difficulty,
        title: '',
        explanation: '',

        data: {
          pairs: [
            { id: generateId(), left: '', right: '' },
            { id: generateId(), left: '', right: '' },
          ],
        },
      };

    case QUESTION_TYPE.OPEN_ENDED:
      return {
        id: baseId,
        type,
        difficulty,
        title: '',
        explanation: '',

        data: {
          expectedAnswer: '',
          maxLength: 500,
        },
      };

    case QUESTION_TYPE.FILL_IN_BLANK:
      return {
        id: baseId,
        type,
        difficulty,
        title: '',
        explanation: '',
        data: {
          segments: [
            { id: generateId(), type: 'text', content: '' },
            { id: generateId(), type: 'blank', content: '' },
          ],
          caseSensitive: false,
        },
      };

    case QUESTION_TYPE.GROUP:
      return {
        id: baseId,
        type,
        difficulty,
        title: '',
        explanation: '',
        data: {
          description: '',
          questions: [],
          showQuestionNumbers: true,
          shuffleQuestions: false,
        },
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
  // Deep copy the question
  const duplicate: Question = JSON.parse(JSON.stringify(question));

  // Generate new top-level ID
  duplicate.id = generateId();

  // Update nested IDs based on question type
  if (duplicate.type === QUESTION_TYPE.MULTIPLE_CHOICE && duplicate.data.options) {
    duplicate.data.options = duplicate.data.options.map((opt) => ({
      ...opt,
      id: generateId(),
    }));
  }

  if (duplicate.type === QUESTION_TYPE.MATCHING && duplicate.data.pairs) {
    duplicate.data.pairs = duplicate.data.pairs.map((pair) => ({
      ...pair,
      id: generateId(),
    }));
  }

  if (duplicate.type === QUESTION_TYPE.FILL_IN_BLANK && duplicate.data.segments) {
    duplicate.data.segments = duplicate.data.segments.map((seg) => ({
      ...seg,
      id: generateId(),
    }));
  }

  if (duplicate.type === QUESTION_TYPE.GROUP && duplicate.data.questions) {
    duplicate.data.questions = duplicate.data.questions.map((subQ) => {
      const newSubQ = { ...subQ, id: generateId() };

      // Also regenerate IDs for nested items within sub-questions
      if (newSubQ.type === QUESTION_TYPE.MULTIPLE_CHOICE && (newSubQ.data as any).options) {
        (newSubQ.data as any).options = (newSubQ.data as any).options.map((opt: any) => ({
          ...opt,
          id: generateId(),
        }));
      }

      if (newSubQ.type === QUESTION_TYPE.MATCHING && (newSubQ.data as any).pairs) {
        (newSubQ.data as any).pairs = (newSubQ.data as any).pairs.map((pair: any) => ({
          ...pair,
          id: generateId(),
        }));
      }

      if (newSubQ.type === QUESTION_TYPE.FILL_IN_BLANK && (newSubQ.data as any).segments) {
        (newSubQ.data as any).segments = (newSubQ.data as any).segments.map((seg: any) => ({
          ...seg,
          id: generateId(),
        }));
      }

      return newSubQ;
    });
  }

  return duplicate;
};
