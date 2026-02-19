import type { Difficulty, QuestionType } from './constants';

/**
 * Assessment Matrix (Table of Specifications) Types
 *
 * 3D Matrix Structure: topic × difficulty × questionType
 * Cell value format: "count:points" (e.g., "3:6" = 3 questions worth 6 total points)
 */

// === Metadata ===

/**
 * Matrix metadata
 */
export interface MatrixMetadata {
  id: string;
  name: string;
  createdAt: string;
}

// === Dimensions ===

/**
 * Topic in matrix dimensions
 */
export interface MatrixDimensionTopic {
  id: string;
  name: string;
  chapters?: string[];
}

/**
 * Matrix dimensions defining the axes of the 3D matrix
 *
 * The arrays define the order of indices:
 * - topics[i] corresponds to matrix[i]
 * - difficulties[j] corresponds to matrix[i][j]
 * - questionTypes[k] corresponds to matrix[i][j][k]
 */
export interface MatrixDimensions {
  topics: MatrixDimensionTopic[];
  difficulties: Difficulty[];
  questionTypes: QuestionType[];
}

// === 3D Matrix Structure ===

/**
 * The complete assessment matrix specification
 *
 * 3D structure where:
 * - matrix[topicIndex][difficultyIndex][questionTypeIndex] = "count:points"
 * - Example: matrix[0][1][0] = "3:6" means:
 *   topics[0] + difficulties[1] + questionTypes[0] = 3 questions, 6 points total
 *   pointsPerQuestion = 6/3 = 2 points each
 */
export interface AssessmentMatrix {
  metadata: MatrixMetadata;
  dimensions: MatrixDimensions;
  matrix: string[][][]; // matrix[topic][difficulty][questionType] = "count:points"
  totalQuestions: number;
  totalPoints: number;
}

// === Validation ===

/**
 * Status of a single matrix cell
 *
 * Tracks whether a cell's requirements are fulfilled during question selection.
 */
export interface MatrixCellStatus {
  topicId: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  required: number;
  selected: number;
  requiredPoints: number;
  selectedPoints: number;
  isFulfilled: boolean;
}

/**
 * Validation result for matrix compliance
 *
 * Checks if selected questions meet matrix requirements.
 */
export interface MatrixValidationResult {
  isValid: boolean;
  totalPoints: number;
  targetPoints: number;
  pointsDifference: number;
  cellsStatus: MatrixCellStatus[];
  errors: string[];
  warnings: string[];
  summary: {
    totalCells: number;
    fulfilledCells: number;
    partialCells: number;
    emptyCells: number;
  };
}

// === Legacy Compatibility Types (to be removed after migration) ===

/**
 * @deprecated Use MatrixDimensionTopic instead
 */
export type TopicId = string;

/**
 * @deprecated Topics are now embedded in MatrixDimensions
 */
export interface Topic {
  id: TopicId;
  name: string;
  description?: string;
}
