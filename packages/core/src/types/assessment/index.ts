/**
 * Assessment Domain Types
 *
 * Core types for the educational assessment system including:
 * - Questions (multiple choice, matching, open-ended, fill-in-blank)
 * - Answers and submissions
 * - Question banks
 * - Exam matrices (table of specifications)
 * - Exam drafts
 *
 * @example
 * ```typescript
 * import { Question, DIFFICULTY, ExamMatrix } from '@aiprimary/core/assessment';
 * ```
 */

export * from './constants';
export * from './question';
export * from './answer';
export * from './questionBank';
export * from './examDraft';
export * from './examMatrix';
