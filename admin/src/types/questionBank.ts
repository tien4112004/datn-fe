/**
 * Admin Question Bank Type Definitions
 *
 * Core types are imported from @aiprimary/core for consistency.
 */

import type { QuestionType, Difficulty, SubjectCode, BankType, QuestionBankItem } from '@aiprimary/core';

export type { QuestionBankItem } from '@aiprimary/core';

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
 * Response structure for question bank API
 */
export interface QuestionBankResponse {
  questions: QuestionBankItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Request payload for creating a new question
 */
export interface CreateQuestionPayload {
  question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
}

/**
 * Request payload for updating an existing question
 */
export interface UpdateQuestionPayload {
  question: Partial<QuestionBankItem>;
}

/**
 * Request types for question bank operations
 */
export interface CreateQuestionRequest {
  question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateQuestionRequest {
  question: Partial<QuestionBankItem>;
}

/**
 * Result of CSV import operation
 */
export interface ImportResult {
  success: number;
  failed: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
}

/**
 * Response from bulk delete operation
 */
export interface BulkDeleteResponse {
  deletedCount: number;
  failedIds?: string[];
}

/**
 * API service interface for question bank operations
 */
export interface QuestionBankApiService {
  getQuestions(filters: QuestionBankFilters): Promise<QuestionBankResponse>;
  getQuestionById(id: string): Promise<QuestionBankItem>;
  createQuestion(
    question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QuestionBankItem>;
  updateQuestion(id: string, question: Partial<QuestionBankItem>): Promise<QuestionBankItem>;
  deleteQuestion(id: string): Promise<void>;
  bulkDeleteQuestions(ids: string[]): Promise<void>;
  duplicateQuestion(id: string): Promise<QuestionBankItem>;
  copyToPersonal(id: string): Promise<QuestionBankItem>;
  exportQuestions(filters?: QuestionBankFilters): Promise<Blob>;
  importQuestions(file: File): Promise<{ success: number; failed: number }>;
}

/**
 * Response structure for chapter from backend API
 */
export interface ChapterResponse {
  id: string;
  name: string;
  grade: string;
  subject: string;
  sortOrder: string;
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
