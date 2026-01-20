import type { SubjectCode } from './constants';
import type { Question } from './question';

/**
 * QuestionBankItem combines Question with additional metadata for the bank
 *
 * Question bank items extend questions with:
 * - Subject classification (required)
 * - Grade level (optional)
 * - Chapter (optional)
 * - Bank type (personal vs application-wide)
 * - Audit metadata (creation/update timestamps and creator)
 *
 * Uses intersection type to include all type-specific fields from Question
 */
export type QuestionBankItem = Question & {
  subject: SubjectCode; // Subject classification (required for bank organization)
  grade?: string; // Grade level (e.g., "1", "2", "3", "4", "5")
  chapter?: string; // Chapter name or identifier
  createdAt?: string; // ISO timestamp of creation
  updatedAt?: string; // ISO timestamp of last update
};
