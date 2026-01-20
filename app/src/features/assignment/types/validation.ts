import { z } from 'zod';
import { QUESTION_TYPE, DIFFICULTY } from '.';

// Translation keys for validation errors
// These will be translated using i18next in the UI layer
const VALIDATION_KEYS = {
  TITLE_REQUIRED: 'questions:validation.titleRequired',
  OPTION_TEXT_REQUIRED: 'questions:validation.optionTextRequired',
  MIN_OPTIONS: 'questions:validation.minOptions',
  MAX_OPTIONS: 'questions:validation.maxOptions',
  EXACTLY_ONE_CORRECT: 'questions:validation.exactlyOneCorrect',
  LEFT_ITEM_REQUIRED: 'questions:validation.leftItemRequired',
  RIGHT_ITEM_REQUIRED: 'questions:validation.rightItemRequired',
  MIN_PAIRS: 'questions:validation.minPairs',
  MAX_PAIRS: 'questions:validation.maxPairs',
  MAX_LENGTH_EXCEEDED: 'questions:validation.maxLengthExceeded',
  MIN_SEGMENTS: 'questions:validation.minSegments',
  SUB_QUESTION_TITLE_REQUIRED: 'questions:validation.subQuestionTitleRequired',
  MIN_SUB_QUESTIONS: 'questions:validation.minSubQuestions',
};

// Base schema
const baseQuestionSchema = z.object({
  id: z.string(),
  difficulty: z.enum([
    DIFFICULTY.KNOWLEDGE,
    DIFFICULTY.COMPREHENSION,
    DIFFICULTY.APPLICATION,
    DIFFICULTY.ADVANCED_APPLICATION,
  ]),
  title: z.string().min(1, VALIDATION_KEYS.TITLE_REQUIRED),
  titleImageUrl: z.string().url().optional().or(z.literal('')),
  explanation: z.string().optional(),
  points: z.number().positive().optional(),
});

// Multiple Choice schema
export const multipleChoiceOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, VALIDATION_KEYS.OPTION_TEXT_REQUIRED),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isCorrect: z.boolean(),
});

export const multipleChoiceQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QUESTION_TYPE.MULTIPLE_CHOICE),
  options: z
    .array(multipleChoiceOptionSchema)
    .min(2, VALIDATION_KEYS.MIN_OPTIONS)
    .max(6, VALIDATION_KEYS.MAX_OPTIONS)
    .refine((options) => options.filter((o) => o.isCorrect).length === 1, {
      message: VALIDATION_KEYS.EXACTLY_ONE_CORRECT,
    }),
});

// Matching schema
export const matchingPairSchema = z.object({
  id: z.string(),
  left: z.string().min(1, VALIDATION_KEYS.LEFT_ITEM_REQUIRED),
  leftImageUrl: z.string().url().optional().or(z.literal('')),
  right: z.string().min(1, VALIDATION_KEYS.RIGHT_ITEM_REQUIRED),
  rightImageUrl: z.string().url().optional().or(z.literal('')),
});

export const matchingQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QUESTION_TYPE.MATCHING),
  pairs: z.array(matchingPairSchema).min(2, VALIDATION_KEYS.MIN_PAIRS).max(8, VALIDATION_KEYS.MAX_PAIRS),
});

// Open-ended schema
export const openEndedQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QUESTION_TYPE.OPEN_ENDED),
  expectedAnswer: z.string().optional(),
  maxLength: z.number().positive().max(5000, VALIDATION_KEYS.MAX_LENGTH_EXCEEDED).optional(),
});

// Fill in blank schema
export const blankSegmentSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'blank']),
  content: z.string(),
  acceptableAnswers: z.array(z.string()).optional(),
});

export const fillInBlankQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QUESTION_TYPE.FILL_IN_BLANK),
  segments: z.array(blankSegmentSchema).min(1, VALIDATION_KEYS.MIN_SEGMENTS),
  caseSensitive: z.boolean().optional(),
});

// Sub-question schema for Group Questions
export const subQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['MULTIPLE_CHOICE', 'MATCHING', 'OPEN_ENDED', 'FILL_IN_BLANK']),
  title: z.string().min(1, VALIDATION_KEYS.SUB_QUESTION_TITLE_REQUIRED),
  titleImageUrl: z.string().url().optional().or(z.literal('')),
  explanation: z.string().optional(),
  data: z.union([
    z.object({
      options: z.array(multipleChoiceOptionSchema),
      shuffleOptions: z.boolean().optional(),
    }),
    z.object({
      pairs: z.array(matchingPairSchema),
      shufflePairs: z.boolean().optional(),
    }),
    z.object({
      expectedAnswer: z.string().optional(),
      maxLength: z.number().positive().max(5000, VALIDATION_KEYS.MAX_LENGTH_EXCEEDED).optional(),
    }),
    z.object({
      segments: z.array(blankSegmentSchema),
      caseSensitive: z.boolean().optional(),
    }),
  ]),
  points: z.number().positive().optional(),
});

// Group Question schema
export const groupQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QUESTION_TYPE.GROUP),
  description: z.string().optional(),
  questions: z.array(subQuestionSchema).min(1, VALIDATION_KEYS.MIN_SUB_QUESTIONS),
  showQuestionNumbers: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
});

// Union schema for all question types
export const questionSchema = z.discriminatedUnion('type', [
  multipleChoiceQuestionSchema,
  matchingQuestionSchema,
  openEndedQuestionSchema,
  fillInBlankQuestionSchema,
  groupQuestionSchema,
]);

export type QuestionSchema = z.infer<typeof questionSchema>;
