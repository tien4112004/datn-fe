import type { AssessmentMatrix, Difficulty, QuestionType } from '@aiprimary/core';
import {
  parseCellValue,
  serializeCellValue,
  difficultyToApi,
  questionTypeToApi,
  difficultyFromApi,
  questionTypeFromApi,
} from '@aiprimary/core';
import type { MatrixCell, ApiMatrix } from '../types';

/**
 * Matrix Conversion Utilities
 *
 * Convert between 3D AssessmentMatrix (API format) and flat MatrixCell array (UI format)
 */

// ============================================================================
// API Conversion Functions
// ============================================================================

/**
 * Convert flat MatrixCell array to API matrix format
 *
 * @param cells - Flat array of MatrixCell from UI
 * @param metadata - Matrix metadata (grade, subject, createdAt)
 * @returns ApiMatrix with lowercase enum values
 */
export function cellsToApiMatrix(
  cells: MatrixCell[],
  metadata: {
    grade?: string | null;
    subject?: string | null;
    createdAt?: string;
  }
): ApiMatrix {
  // Extract unique dimensions (preserving order from cells)
  const topicsMap = new Map<string, { id: string; name: string }>();
  const difficultiesSet = new Set<Difficulty>();
  const questionTypesSet = new Set<QuestionType>();

  cells.forEach((cell) => {
    if (!topicsMap.has(cell.topicId)) {
      topicsMap.set(cell.topicId, { id: cell.topicId, name: cell.topicName });
    }
    difficultiesSet.add(cell.difficulty);
    questionTypesSet.add(cell.questionType);
  });

  const topics = Array.from(topicsMap.values());
  const difficulties = Array.from(difficultiesSet);
  const questionTypes = Array.from(questionTypesSet);

  // Build 3D matrix with "count:points" format
  const matrix: string[][][] = topics.map((topic) =>
    difficulties.map((difficulty) =>
      questionTypes.map((questionType) => {
        const cell = cells.find(
          (c) => c.topicId === topic.id && c.difficulty === difficulty && c.questionType === questionType
        );
        if (!cell || cell.requiredCount === 0) return '0:0';
        // Format as "count:points" with decimal for points
        return `${cell.requiredCount}:${cell.requiredCount.toFixed(1)}`;
      })
    )
  );

  // Calculate totals
  let totalQuestions = 0;
  let totalPoints = 0;
  cells.forEach((cell) => {
    totalQuestions += cell.requiredCount;
    totalPoints += cell.requiredCount; // 1 point per question by default
  });

  return {
    grade: metadata.grade ?? null,
    subject: metadata.subject ?? null,
    createdAt: metadata.createdAt ?? new Date().toISOString(),
    dimensions: {
      topics,
      difficulties: difficulties.map(difficultyToApi), // Convert to lowercase
      questionTypes: questionTypes.map(questionTypeToApi), // Convert to lowercase
    },
    matrix,
    totalQuestions,
    totalPoints,
  };
}

/**
 * Convert API matrix format to flat MatrixCell array for UI
 *
 * @param apiMatrix - Matrix from API (lowercase enums)
 * @returns Flat array of MatrixCell for UI
 */
export function apiMatrixToCells(apiMatrix: ApiMatrix): MatrixCell[] {
  const cells: MatrixCell[] = [];
  const { dimensions, matrix } = apiMatrix;

  dimensions.topics.forEach((topic, topicIdx) => {
    dimensions.difficulties.forEach((difficultyApi, diffIdx) => {
      dimensions.questionTypes.forEach((questionTypeApi, qtIdx) => {
        const cellValue = matrix[topicIdx]?.[diffIdx]?.[qtIdx] || '0:0';
        const { count } = parseCellValue(cellValue);

        // Convert from API format (lowercase) to frontend format (UPPERCASE)
        const difficulty = difficultyFromApi(difficultyApi);
        const questionType = questionTypeFromApi(questionTypeApi);

        cells.push({
          id: `${topic.id}-${difficulty}-${questionType}`,
          topicId: topic.id,
          topicName: topic.name,
          difficulty,
          questionType,
          requiredCount: count,
          currentCount: 0,
        });
      });
    });
  });

  return cells;
}

// ============================================================================
// Frontend Matrix Conversion Functions
// ============================================================================

/**
 * Convert 3D AssessmentMatrix to flat MatrixCell array for UI
 *
 * @param matrix - The 3D assessment matrix from API
 * @returns Flat array of MatrixCell for UI rendering
 */
export function assessmentMatrixToCells(matrix: AssessmentMatrix): MatrixCell[] {
  const cells: MatrixCell[] = [];
  const { dimensions } = matrix;

  dimensions.topics.forEach((topic, topicIdx) => {
    dimensions.difficulties.forEach((difficulty, diffIdx) => {
      dimensions.questionTypes.forEach((questionType, qtIdx) => {
        const cellValue = matrix.matrix[topicIdx]?.[diffIdx]?.[qtIdx] || '0:0';
        const { count } = parseCellValue(cellValue);

        cells.push({
          id: `${topic.id}-${difficulty}-${questionType}`,
          topicId: topic.id,
          topicName: topic.name,
          difficulty,
          questionType,
          requiredCount: count,
          currentCount: 0,
        });
      });
    });
  });

  return cells;
}

/**
 * Convert flat MatrixCell array back to 3D AssessmentMatrix
 *
 * @param cells - Flat array of MatrixCell from UI
 * @param metadata - Matrix metadata (id, name, createdAt)
 * @returns 3D AssessmentMatrix for API
 */
export function cellsToAssessmentMatrix(
  cells: MatrixCell[],
  metadata: { id: string; name: string; createdAt: string }
): AssessmentMatrix {
  // Extract unique dimensions (preserving order from cells)
  const topicsMap = new Map<string, { id: string; name: string }>();
  const difficultiesSet = new Set<Difficulty>();
  const questionTypesSet = new Set<QuestionType>();

  cells.forEach((cell) => {
    if (!topicsMap.has(cell.topicId)) {
      topicsMap.set(cell.topicId, { id: cell.topicId, name: cell.topicName });
    }
    difficultiesSet.add(cell.difficulty);
    questionTypesSet.add(cell.questionType);
  });

  const topics = Array.from(topicsMap.values());
  const difficulties = Array.from(difficultiesSet);
  const questionTypes = Array.from(questionTypesSet);

  // Build 3D matrix
  const matrix: string[][][] = topics.map((topic) =>
    difficulties.map((difficulty) =>
      questionTypes.map((questionType) => {
        const cell = cells.find(
          (c) => c.topicId === topic.id && c.difficulty === difficulty && c.questionType === questionType
        );
        if (!cell) return '0:0';
        return serializeCellValue(cell.requiredCount, 0);
      })
    )
  );

  // Calculate totals
  let totalQuestions = 0;
  cells.forEach((cell) => {
    totalQuestions += cell.requiredCount;
  });

  return {
    metadata,
    dimensions: { topics, difficulties, questionTypes },
    matrix,
    totalQuestions,
    totalPoints: 0,
  };
}

/**
 * Create a cell ID from components
 */
export function createCellId(topicId: string, difficulty: Difficulty, questionType: QuestionType): string {
  return `${topicId}-${difficulty}-${questionType}`;
}

/**
 * Parse a cell ID into components
 */
export function parseCellId(
  cellId: string
): { topicId: string; difficulty: Difficulty; questionType: QuestionType } | null {
  const parts = cellId.split('-');
  if (parts.length < 3) return null;

  // The topicId might contain dashes, so we need to handle that
  // Format: topicId-DIFFICULTY-QUESTION_TYPE
  // DIFFICULTY and QUESTION_TYPE are UPPER_SNAKE_CASE
  const questionType = parts.pop() as QuestionType;
  const difficulty = parts.pop() as Difficulty;
  const topicId = parts.join('-');

  return { topicId, difficulty, questionType };
}
