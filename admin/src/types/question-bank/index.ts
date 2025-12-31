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
 */
export interface QuestionBankParams {
  page?: number;
  pageSize?: number;
  searchText?: string;
  questionType?: QuestionType;
  difficulty?: Difficulty;
  subjectCode?: SubjectCode;
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
