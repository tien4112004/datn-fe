import { z } from 'zod';
import { QUESTION_TYPE, DIFFICULTY } from './constants';

// Base schema
const baseQuestionSchema = z.object({
  id: z.string(),
  difficulty: z.enum([DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD, DIFFICULTY.SUPER_HARD]),
  title: z.string().min(1, 'Title is required'),
  titleImageUrl: z.string().url().optional().or(z.literal('')),
  explanation: z.string().optional(),
  points: z.number().positive().optional(),
});

// Multiple Choice schema
export const multipleChoiceOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isCorrect: z.boolean(),
});

export const multipleChoiceQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QUESTION_TYPE.MULTIPLE_CHOICE),
  options: z
    .array(multipleChoiceOptionSchema)
    .min(2, 'At least 2 options required')
    .max(6, 'Maximum 6 options allowed')
    .refine((options) => options.filter((o) => o.isCorrect).length === 1, {
      message: 'Exactly one option must be marked as correct',
    }),
});

// Matching schema
export const matchingPairSchema = z.object({
  id: z.string(),
  left: z.string().min(1, 'Left item is required'),
  leftImageUrl: z.string().url().optional().or(z.literal('')),
  right: z.string().min(1, 'Right item is required'),
  rightImageUrl: z.string().url().optional().or(z.literal('')),
});

export const matchingQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QUESTION_TYPE.MATCHING),
  pairs: z.array(matchingPairSchema).min(2, 'At least 2 pairs required').max(8, 'Maximum 8 pairs allowed'),
});

// Open-ended schema
export const openEndedQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QUESTION_TYPE.OPEN_ENDED),
  expectedAnswer: z.string().optional(),
  maxLength: z.number().positive().max(5000).optional(),
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
  segments: z.array(blankSegmentSchema).min(1, 'At least one segment required'),
  caseSensitive: z.boolean().optional(),
});

// Union schema for all question types
export const questionSchema = z.discriminatedUnion('type', [
  multipleChoiceQuestionSchema,
  matchingQuestionSchema,
  openEndedQuestionSchema,
  fillInBlankQuestionSchema,
]);

export type QuestionSchema = z.infer<typeof questionSchema>;
