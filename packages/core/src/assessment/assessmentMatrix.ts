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
  id: TopicId; // Unique identifier for this topic
  name: string; // Topic name (e.g., "Algebra", "Đại số")
  description?: string; // Optional description of the topic
  subject: SubjectCode; // Subject this topic belongs to (T=Math, TV=Vietnamese, TA=English)
  createdAt?: string; // ISO timestamp of creation
  updatedAt?: string; // ISO timestamp of last update
}

/**
 * A single cell in the exam matrix grid
 *
 * Represents the intersection of a topic and difficulty level.
 * Example: "Algebra × Vận dụng cao" might require 2 questions worth 5 points each.
 */
export interface MatrixCell {
  id: string; // Unique identifier for this cell
  topicId: TopicId; // Reference to the topic
  difficulty: Difficulty; // Difficulty level for this cell
  requiredQuestionCount: number; // How many questions needed for this cell
  pointsPerQuestion: number; // Points allocated per question
  selectedQuestions?: string[]; // Question IDs currently selected for this cell (Runtime tracking, not persisted to backend)
}

/**
 * The complete exam matrix specification
 *
 * Defines the structure and requirements for an exam.
 * Acts as a blueprint that guides question selection.
 */
export interface AssessmentMatrix {
  id: string; // Unique identifier for this matrix
  name: string; // Matrix name (e.g., "Midterm Exam - Grade 10 Math")
  description?: string; // Optional description
  subject: SubjectCode; // Subject of the exam
  targetTotalPoints: number; // Target total points for the exam (e.g., 100)
  topics: Topic[]; // Topics included in this matrix
  cells: MatrixCell[]; // Matrix cell specifications (topic × difficulty combinations)
  createdAt?: string; // ISO timestamp of creation
  updatedAt?: string; // ISO timestamp of last update
  createdBy?: string; // User ID of creator
}

/**
 * Matrix with populated question selections
 *
 * Used during question selection workflow.
 * Extends AssessmentMatrix with actual selected questions in each cell.
 */
export interface AssessmentMatrixWithQuestions extends AssessmentMatrix {
  cells: (MatrixCell & { selectedQuestions: string[] })[]; // Cells with guaranteed selectedQuestions array
}

/**
 * Status of a single matrix cell
 *
 * Tracks whether a cell's requirements are fulfilled during question selection.
 */
export interface MatrixCellStatus {
  cellId: string; // Reference to the cell
  topicId: TopicId; // Reference to the topic
  difficulty: Difficulty; // Difficulty level
  required: number; // Required question count
  selected: number; // Currently selected question count
  requiredPoints: number; // Required total points
  selectedPoints: number; // Currently selected total points
  isFulfilled: boolean; // Whether this cell meets requirements
}

/**
 * Validation result for matrix compliance
 *
 * Checks if selected questions meet matrix requirements.
 * Used to validate before generating exam draft or publishing.
 */
export interface MatrixValidationResult {
  isValid: boolean; // Overall validation status
  totalPoints: number; // Current total points from selected questions
  targetPoints: number; // Target total points from matrix specification
  pointsDifference: number; // Difference between current and target (current - target)
  cellsStatus: MatrixCellStatus[]; // Status of each cell in the matrix
  errors: string[]; // Validation errors (must fix before publishing)
  warnings: string[]; // Validation warnings (should review but not blocking)
  summary: {
    // Summary statistics
    totalCells: number; // Total number of cells in matrix
    fulfilledCells: number; // Cells that meet requirements
    partialCells: number; // Cells with some questions but not enough
    emptyCells: number; // Cells with no questions selected
  };
}
