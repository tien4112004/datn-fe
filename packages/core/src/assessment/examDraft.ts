import type { AssignmentQuestion } from './question';

/**
 * Matrix gap - describes unfilled requirements in an exam draft
 */
export interface MatrixGapDto {
  topic: string;
  difficulty: string;
  questionType: string;
  requiredCount: number;
  availableCount: number;
  gapCount: number;
}

/**
 * Exam draft generated from an assessment matrix
 */
export interface ExamDraft {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  subject: string;
  grade: string;
  questions: AssignmentQuestion[];
  missingQuestions: MatrixGapDto[];
  totalPoints: number;
  totalQuestions: number;
  isComplete: boolean;
}
