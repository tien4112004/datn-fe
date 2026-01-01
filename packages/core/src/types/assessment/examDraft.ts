import type { Question } from './question';
import type { SubjectCode } from './constants';

/**
 * Exam Draft - Generated from an exam matrix template
 *
 * Represents an exam instance created by selecting questions according to
 * matrix specifications (table of specifications).
 *
 * The workflow is:
 * 1. Create an ExamMatrix (blueprint with requirements)
 * 2. Select questions from question bank to fulfill matrix requirements
 * 3. Generate ExamDraft with selected questions
 * 4. Optionally convert to Assignment for student distribution
 */
export interface ExamDraft {
  /** Unique identifier for this exam draft */
  id: string;
  /** Auto-generated name from matrix name + date */
  name: string;
  /** Reference to the source exam matrix */
  matrixId: string;
  /** Cached matrix name for display */
  matrixName: string;
  /** Subject of the exam */
  subjectCode: SubjectCode;
  /** Target total points for the exam */
  targetPoints: number;
  /** Full question objects selected for this exam */
  questions: Question[];
  /** Mapping of questionId → cellId (which matrix cell each question fulfills) */
  questionSelections: Record<string, string>;
  /** ISO timestamp of creation */
  createdAt: string;
}
