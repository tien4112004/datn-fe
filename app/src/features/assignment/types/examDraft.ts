import type { Question } from './question';
import type { SubjectCode } from './constants';

/**
 * Exam Draft - Generated from an exam matrix template
 * Represents an exam instance created by selecting questions according to matrix specifications
 */
export interface ExamDraft {
  id: string;
  name: string; // Auto-generated from matrix name + date
  matrixId: string; // Reference to source matrix
  matrixName: string; // Cached for display
  subjectCode: SubjectCode;
  targetPoints: number;
  questions: Question[]; // Full question objects
  questionSelections: Record<string, string>; // questionId → cellId mapping
  createdAt: string;
}

/**
 * Filters for querying exam drafts
 */
export interface ExamDraftFilters {
  searchText?: string;
  subjectCode?: SubjectCode;
  matrixId?: string;
}
