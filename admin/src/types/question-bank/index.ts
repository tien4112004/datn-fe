/**
 * Admin Question Bank Type Definitions
 *
 * This module contains type definitions for the admin question bank management system.
 * These types are copied from the teacher app to maintain independence between apps.
 */

// Re-export all types from sub-modules
export * from './constants';
export * from './question';
export * from './questionBank';

// Admin-specific types
import type { QuestionType, Difficulty, SubjectCode } from './constants';
import type { QuestionBankItem } from './questionBank';

/**
 * Query parameters for listing questions in admin panel
 * Supports both single values and arrays for backward compatibility
 */
export interface QuestionBankParams {
  page?: number;
  pageSize?: number;
  searchText?: string;
  // Support both single and multi-select for filters
  questionType?: QuestionType | QuestionType[];
  difficulty?: Difficulty | Difficulty[];
  subjectCode?: SubjectCode | SubjectCode[] | string | string[]; // Support both predefined codes and custom strings from API
  // New filters for grade and chapter
  grade?: string | string[];
  chapter?: string | string[];
}

/**
 * Request payload for creating a new question
 * Omits auto-generated fields (id, timestamps, createdBy)
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
 * Result of CSV import operation
 */
export interface ImportResult {
  success: number; // Number of successfully imported questions
  failed: number; // Number of failed imports
  errors?: Array<{
    row: number; // Row number in CSV (1-indexed)
    error: string; // Error message
  }>;
}

/**
 * Response from bulk delete operation
 */
export interface BulkDeleteResponse {
  deletedCount: number;
  failedIds?: string[];
}
