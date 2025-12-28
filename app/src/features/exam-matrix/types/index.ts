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
