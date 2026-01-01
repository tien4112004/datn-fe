import type { Difficulty, SubjectCode } from './constants';

/**
 * Exam Matrix (Table of Specifications) Types
 *
 * Used for creating structured exam blueprints that specify:
 * - How many questions needed per topic/difficulty combination
 * - Point distribution across the exam
 * - Validation criteria for exam construction
 */

/**
 * Unique identifier for topics
 */
export type TopicId = string;

/**
 * Topic metadata
 *
 * Topics are reusable across matrices within the same subject.
 * Examples: "Algebra", "Geometry", "Functions" for Math subject
 */
export interface Topic {
  /** Unique identifier for this topic */
  id: TopicId;
  /** Topic name (e.g., "Algebra", "Đại số") */
  name: string;
  /** Optional description of the topic */
  description?: string;
  /** Subject this topic belongs to (T=Math, TV=Vietnamese, TA=English) */
  subjectCode: SubjectCode;
  /** User ID of creator (for multi-user support) */
  createdBy?: string;
  /** ISO timestamp of creation */
  createdAt?: string;
  /** ISO timestamp of last update */
  updatedAt?: string;
}

/**
 * A single cell in the exam matrix grid
 *
 * Represents the intersection of a topic and difficulty level.
 * Example: "Algebra × Vận dụng cao" might require 2 questions worth 5 points each.
 */
export interface MatrixCell {
  /** Unique identifier for this cell */
  id: string;
  /** Reference to the topic */
  topicId: TopicId;
  /** Difficulty level for this cell */
  difficulty: Difficulty;
  /** How many questions needed for this cell */
  requiredQuestionCount: number;
  /** Points allocated per question */
  pointsPerQuestion: number;

  // Runtime tracking (not persisted to backend)
  /** Question IDs currently selected for this cell */
  selectedQuestions?: string[];
}

/**
 * The complete exam matrix specification
 *
 * Defines the structure and requirements for an exam.
 * Acts as a blueprint that guides question selection.
 */
export interface ExamMatrix {
  /** Unique identifier for this matrix */
  id: string;
  /** Matrix name (e.g., "Midterm Exam - Grade 10 Math") */
  name: string;
  /** Optional description */
  description?: string;
  /** Subject of the exam */
  subjectCode: SubjectCode;
  /** Target total points for the exam (e.g., 100) */
  targetTotalPoints: number;
  /** Topics included in this matrix */
  topics: Topic[];
  /** Matrix cell specifications (topic × difficulty combinations) */
  cells: MatrixCell[];
  /** ISO timestamp of creation */
  createdAt?: string;
  /** ISO timestamp of last update */
  updatedAt?: string;
  /** User ID of creator */
  createdBy?: string;
}

/**
 * Matrix with populated question selections
 *
 * Used during question selection workflow.
 * Extends ExamMatrix with actual selected questions in each cell.
 */
export interface ExamMatrixWithQuestions extends ExamMatrix {
  /** Cells with guaranteed selectedQuestions array */
  cells: (MatrixCell & { selectedQuestions: string[] })[];
}

/**
 * Status of a single matrix cell
 *
 * Tracks whether a cell's requirements are fulfilled during question selection.
 */
export interface MatrixCellStatus {
  /** Reference to the cell */
  cellId: string;
  /** Reference to the topic */
  topicId: TopicId;
  /** Difficulty level */
  difficulty: Difficulty;
  /** Required question count */
  required: number;
  /** Currently selected question count */
  selected: number;
  /** Required total points */
  requiredPoints: number;
  /** Currently selected total points */
  selectedPoints: number;
  /** Whether this cell meets requirements */
  isFulfilled: boolean;
}

/**
 * Validation result for matrix compliance
 *
 * Checks if selected questions meet matrix requirements.
 * Used to validate before generating exam draft or publishing.
 */
export interface MatrixValidationResult {
  /** Overall validation status */
  isValid: boolean;
  /** Current total points from selected questions */
  totalPoints: number;
  /** Target total points from matrix specification */
  targetPoints: number;
  /** Difference between current and target (current - target) */
  pointsDifference: number;
  /** Status of each cell in the matrix */
  cellsStatus: MatrixCellStatus[];
  /** Validation errors (must fix before publishing) */
  errors: string[];
  /** Validation warnings (should review but not blocking) */
  warnings: string[];
  /** Summary statistics */
  summary: {
    /** Total number of cells in matrix */
    totalCells: number;
    /** Cells that meet requirements */
    fulfilledCells: number;
    /** Cells with some questions but not enough */
    partialCells: number;
    /** Cells with no questions selected */
    emptyCells: number;
  };
}
