import type { AssessmentMatrix } from './assessmentMatrix';

/**
 * Assessment Matrix Utility Functions
 *
 * Utilities for working with 3D matrix cell values in "count:points" format
 */

/**
 * Parsed cell value from "count:points" format
 */
export interface ParsedCellValue {
  count: number;
  points: number;
}

/**
 * Parse a cell value string into count and points
 *
 * @param cellValue - String in "count:points" format (e.g., "3:6")
 * @returns Parsed count and points
 *
 * @example
 * parseCellValue("3:6") // { count: 3, points: 6 }
 * parseCellValue("0:0") // { count: 0, points: 0 }
 * parseCellValue("invalid") // { count: 0, points: 0 }
 */
export function parseCellValue(cellValue: string): ParsedCellValue {
  const [countStr, pointsStr] = cellValue.split(':');
  return {
    count: parseInt(countStr, 10) || 0,
    points: parseFloat(pointsStr) || 0,
  };
}

/**
 * Serialize count and points into cell value string
 *
 * @param count - Number of questions
 * @param points - Total points for those questions
 * @returns String in "count:points" format
 *
 * @example
 * serializeCellValue(3, 6) // "3:6"
 * serializeCellValue(0, 0) // "0:0"
 */
export function serializeCellValue(count: number, points: number): string {
  return `${count}:${points}`;
}

/**
 * Get parsed cell value from matrix by indices
 *
 * @param matrix - The assessment matrix
 * @param topicIndex - Index in dimensions.topics
 * @param difficultyIndex - Index in dimensions.difficulties
 * @param questionTypeIndex - Index in dimensions.questionTypes
 * @returns Parsed cell value or { count: 0, points: 0 } if out of bounds
 */
export function getMatrixCell(
  matrix: AssessmentMatrix,
  topicIndex: number,
  difficultyIndex: number,
  questionTypeIndex: number
): ParsedCellValue {
  const cellValue = matrix.matrix[topicIndex]?.[difficultyIndex]?.[questionTypeIndex] || '0:0';
  return parseCellValue(cellValue);
}

/**
 * Calculate totals from matrix
 *
 * @param matrix - The assessment matrix
 * @returns Total questions and total points
 */
export function calculateMatrixTotals(matrix: AssessmentMatrix): { totalQuestions: number; totalPoints: number } {
  let totalQuestions = 0;
  let totalPoints = 0;

  matrix.matrix.forEach((topicArr) => {
    topicArr.forEach((diffArr) => {
      diffArr.forEach((cellValue) => {
        const { count, points } = parseCellValue(cellValue);
        totalQuestions += count;
        totalPoints += points;
      });
    });
  });

  return { totalQuestions, totalPoints };
}

/**
 * Create an empty 3D matrix with given dimensions
 *
 * @param topicCount - Number of topics
 * @param difficultyCount - Number of difficulties
 * @param questionTypeCount - Number of question types
 * @returns 3D array initialized with "0:0"
 */
export function createEmptyMatrix(
  topicCount: number,
  difficultyCount: number,
  questionTypeCount: number
): string[][][] {
  return Array.from({ length: topicCount }, () =>
    Array.from({ length: difficultyCount }, () => Array.from({ length: questionTypeCount }, () => '0:0'))
  );
}

/**
 * Get points per question from cell value
 *
 * @param cellValue - String in "count:points" format
 * @returns Points per question (points / count), or 0 if count is 0
 */
export function getPointsPerQuestion(cellValue: string): number {
  const { count, points } = parseCellValue(cellValue);
  return count > 0 ? points / count : 0;
}
