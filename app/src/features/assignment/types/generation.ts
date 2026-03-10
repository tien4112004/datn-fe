import type { QuestionBankItem } from '@/features/question-bank/types';
import type { AssignmentContext } from '@aiprimary/core';

/**
 * Request type for generating questions from a context (reading passage).
 */
export interface GenerateQuestionsFromContextRequest {
  /** Context ID (optional - used when context exists in DB) */
  contextId?: string;
  /** Inline context content (used when context may not exist in DB) */
  contextContent?: string;
  /** Context title */
  contextTitle?: string;
  /** Grade level */
  grade?: string;
  /** Subject code */
  subject?: string;
  /** difficulty -> questionType -> "count:points" */
  questionsPerDifficulty: Record<string, Record<string, string>>;
  /** Optional AI prompt/guidelines */
  prompt?: string;
  /** AI provider */
  provider?: string;
  /** AI model */
  model?: string;
}

/**
 * Response type for generate-from-context endpoint.
 */
export interface GenerateQuestionsFromContextResponse {
  totalGenerated: number;
  questions: QuestionBankItem[];
}

/**
 * Request type for generating questions by topic (matrix gap filling).
 */
export interface GenerateQuestionsByTopicRequest {
  /** Grade level */
  grade: string;
  /** Subject code */
  subject: string;
  /** Topic name for generating questions */
  topicName: string;
  /** Whether to use context-based questions (reading passages) */
  hasContext: boolean;
  /** 2D map: difficulty -> questionType -> "count:points" */
  questionsPerDifficulty: Record<string, Record<string, string>>;
  /** Optional AI prompt/guidelines */
  prompt?: string;
  /** AI provider */
  provider?: string;
  /** AI model */
  model?: string;
}

/**
 * Response type for generate-by-topic endpoint.
 */
export interface GenerateQuestionsByTopicResponse {
  totalGenerated: number;
  /** Array of generated questions (NOT saved to question bank) */
  questions: QuestionBankItem[];
  /** Selected context info when hasContext=true */
  context?: AssignmentContext;
}
