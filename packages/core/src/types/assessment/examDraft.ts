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
  id: string; // Unique identifier for this exam draft
  name: string; // Auto-generated name from matrix name + date
  matrixId: string; // Reference to the source exam matrix
  matrixName: string; // Cached matrix name for display
  subjectCode: SubjectCode; // Subject of the exam
  targetPoints: number; // Target total points for the exam
  questions: Question[]; // Full question objects selected for this exam
  questionSelections: Record<string, string>; // Mapping of questionId → cellId (which matrix cell each question fulfills)
  createdAt: string; // ISO timestamp of creation
}
