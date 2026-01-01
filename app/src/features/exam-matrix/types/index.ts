/**
 * Exam Matrix (Table of Specifications) Types
 *
 * This file separates core domain types (moved to @aiprimary/core)
 * from UI/API-specific types (remain in app)
 */

// Re-export core domain types from @aiprimary/core
export type {
  Topic,
  TopicId,
  MatrixCell,
  ExamMatrix,
  ExamMatrixWithQuestions,
  MatrixCellStatus,
  MatrixValidationResult,
  Difficulty,
  SubjectCode,
} from '@aiprimary/core';

/**
 * Filters for exam matrix list
 * UI/API-specific type for filtering matrix lists
 */
export interface ExamMatrixFilters {
  searchText?: string;
  subjectCode?: import('@aiprimary/core').SubjectCode;
  createdBy?: string;
  page?: number;
  limit?: number;
}

/**
 * API response for matrix list
 * UI/API-specific type for paginated responses
 */
export interface ExamMatrixResponse {
  matrices: import('@aiprimary/core').ExamMatrix[];
  total: number;
  page: number;
  limit: number;
}
