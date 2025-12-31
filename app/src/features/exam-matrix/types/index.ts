import type { Difficulty } from '@/features/assignment/types';
import type { SubjectCode as SubjectCodeType } from '@/features/assignment/types/questionBank';

/**
 * Exam Matrix (Table of Specifications) Types
 *
 * Used for creating structured exam blueprints that specify:
 * - How many questions needed per topic/difficulty combination
 * - Point distribution across the exam
 * - Validation criteria for exam construction
 */

// Re-export SubjectCode for convenience
export type SubjectCode = SubjectCodeType;

// Unique identifier for topics
export type TopicId = string;

/**
 * A single cell in the exam matrix grid
 * Represents the intersection of a topic and difficulty level
 */
export interface MatrixCell {
  id: string;
  topicId: TopicId;
  difficulty: Difficulty; // nhan_biet, thong_hieu, van_dung, van_dung_cao
  requiredQuestionCount: number; // How many questions needed for this cell
  pointsPerQuestion: number; // Points allocated per question
  // Runtime tracking (not persisted to backend)
  selectedQuestions?: string[]; // Question IDs currently selected for this cell
}

/**
 * Topic metadata
 * Topics are reusable across matrices within the same subject
 */
export interface Topic {
  id: TopicId;
  name: string; // e.g., "Algebra", "Đại số"
  description?: string;
  subjectCode: SubjectCode; // T (Math), TV (Vietnamese), TA (English)
  createdBy?: string; // For multi-user support (future)
  createdAt?: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}

/**
 * The complete exam matrix specification
 * Defines the structure and requirements for an exam
 */
export interface ExamMatrix {
  id: string;
  name: string; // e.g., "Midterm Exam - Grade 10 Math"
  description?: string;
  subjectCode: SubjectCode;
  targetTotalPoints: number; // Target exam score (e.g., 100)
  topics: Topic[]; // Topics included in this matrix
  cells: MatrixCell[]; // Matrix specifications (topic × difficulty)
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

/**
 * Matrix with populated question selections
 * Used during question selection workflow
 */
export interface ExamMatrixWithQuestions extends ExamMatrix {
  cells: (MatrixCell & { selectedQuestions: string[] })[];
}

/**
 * Status of a single matrix cell
 */
export interface MatrixCellStatus {
  cellId: string;
  topicId: TopicId;
  difficulty: Difficulty;
  required: number; // Required question count
  selected: number; // Currently selected question count
  requiredPoints: number; // Required total points
  selectedPoints: number; // Currently selected total points
  isFulfilled: boolean; // Whether this cell meets requirements
}

/**
 * Validation result for matrix compliance
 * Checks if selected questions meet matrix requirements
 */
export interface MatrixValidationResult {
  isValid: boolean;
  totalPoints: number; // Current total points
  targetPoints: number; // Target total points
  pointsDifference: number; // Difference between current and target
  cellsStatus: MatrixCellStatus[];
  errors: string[]; // Validation errors (must fix before publishing)
  warnings: string[]; // Validation warnings (should review but not blocking)
  summary: {
    totalCells: number;
    fulfilledCells: number;
    partialCells: number;
    emptyCells: number;
  };
}

/**
 * Filters for exam matrix list
 */
export interface ExamMatrixFilters {
  searchText?: string;
  subjectCode?: SubjectCode;
  createdBy?: string;
  page?: number;
  limit?: number;
}

/**
 * API response for matrix list
 */
export interface ExamMatrixResponse {
  matrices: ExamMatrix[];
  total: number;
  page: number;
  limit: number;
}
