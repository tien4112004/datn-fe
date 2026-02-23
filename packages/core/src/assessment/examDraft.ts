import type { AssignmentQuestion } from './question';
import type { Difficulty, QuestionType, SubjectCode } from './constants';

/**
 * Matrix gap - describes unfilled requirements in an exam draft
 */
export interface MatrixGapDto {
  topic: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  requiredCount: number;
  availableCount: number;
  gapCount: number;
}

/**
 * Exam draft generated from an assessment matrix
 */
export interface AssignmentDraft {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  subject: SubjectCode;
  grade: string;
  questions: AssignmentQuestion[];
  missingQuestions: MatrixGapDto[];
  totalPoints: number;
  totalQuestions: number;
  isComplete: boolean;
}
