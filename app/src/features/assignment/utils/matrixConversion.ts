import type { AssessmentMatrix, Difficulty, QuestionType } from '@aiprimary/core';
import { parseCellValue, serializeCellValue } from '@aiprimary/core';
import type { MatrixCell } from '../types';

/**
 * Matrix Conversion Utilities
 *
 * Convert between 3D AssessmentMatrix (API format) and flat MatrixCell array (UI format)
 */

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
