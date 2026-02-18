/**
 * Admin Question Bank Type Definitions
 *
 * Shared types are re-exported from @aiprimary/core for consistency.
 * Admin-specific types (filters, params, service interface) remain local.
 */

import type { QuestionType, Difficulty, SubjectCode, BankType } from '@aiprimary/core';

// Re-export shared types from core
export type {
  QuestionBankItem,
  QuestionBankListResponse,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ChapterResponse,
  ImportResult,
} from '@aiprimary/core';

import type { QuestionBankListResponse, CreateQuestionRequest, UpdateQuestionRequest } from '@aiprimary/core';

// Backward-compatible aliases used throughout admin
export type QuestionBankResponse = QuestionBankListResponse;
export type CreateQuestionPayload = CreateQuestionRequest;
export type UpdateQuestionPayload = UpdateQuestionRequest;

/**
 * Filters for querying the question bank
 */
export interface QuestionBankFilters {
  searchText?: string;
  questionType?: QuestionType | QuestionType[];
  difficulty?: Difficulty | Difficulty[];
  subject?: SubjectCode | SubjectCode[] | string | string[];
  grade?: string | string[];
  chapter?: string | string[];
  bankType?: BankType;
  page?: number;
  limit?: number;
}

/**
 * Query parameters for listing questions in admin panel
 * Supports both single values and arrays for backward compatibility
 */
export interface QuestionBankParams {
  page?: number;
  pageSize?: number;
  searchText?: string;
  questionType?: QuestionType | QuestionType[];
  difficulty?: Difficulty | Difficulty[];
  subject?: SubjectCode | SubjectCode[] | string | string[];
  grade?: string | string[];
  chapter?: string | string[];
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

/**
 * Response from bulk delete operation
 */
export interface BulkDeleteResponse {
  deletedCount: number;
  failedIds?: string[];
}

// Re-export core types and constants for convenience
export type {
  Question,
  QuestionType,
  Difficulty,
  SubjectCode,
  BankType,
  MultipleChoiceQuestion,
  MultipleChoiceOption,
  MatchingQuestion,
  MatchingPair,
  OpenEndedQuestion,
  FillInBlankQuestion,
  BlankSegment,
  BlankSegment as FillInBlankSegment,
} from '@aiprimary/core';

export {
  QUESTION_TYPE,
  QUESTION_TYPE_LABELS,
  getQuestionTypeName,
  DIFFICULTY,
  DIFFICULTY_LABELS,
  getDifficultyName,
  SUBJECT_CODE,
  BANK_TYPE,
  VIEW_MODE,
} from '@aiprimary/core';
