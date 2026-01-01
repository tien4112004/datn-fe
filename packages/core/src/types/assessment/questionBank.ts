import type { SubjectCode, BankType } from './constants';
import type { Question } from './question';

/**
 * QuestionBankItem combines Question with additional metadata for the bank
 *
 * Question bank items extend questions with:
 * - Subject classification (required)
 * - Bank type (personal vs application-wide)
 * - Audit metadata (creation/update timestamps and creator)
 *
 * Uses intersection type to include all type-specific fields from Question
 */
export type QuestionBankItem = Question & {
  /** Subject classification (required for bank organization) */
  subjectCode: SubjectCode;
  /** Personal (teacher's own) or Application (school-wide) */
  bankType: BankType;
  /** ISO timestamp of creation */
  createdAt?: string;
  /** ISO timestamp of last update */
  updatedAt?: string;
  /** User ID of the question creator */
  createdBy?: string;
};
