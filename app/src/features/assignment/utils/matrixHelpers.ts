import type {
  MatrixCell,
  MatrixCellWithValidation,
  MatrixValidationResult,
  MatrixCellStatus,
} from '../types';
import { createCellId, type ConstantItem, type Difficulty, type QuestionType } from '@aiprimary/core';

/**
 * Validate a single matrix cell and return validation status
 */
export const validateMatrixCell = (cell: MatrixCell): MatrixCellWithValidation => {
  const { currentCount, requiredCount } = cell;

  if (requiredCount === 0 && currentCount === 0) {
    // Empty cell is valid (no requirement)
    return {
      ...cell,
      status: 'valid',
      message: undefined,
    };
  }

  if (currentCount < requiredCount) {
    return {
      ...cell,
      status: 'warning',
      message: `Need ${requiredCount - currentCount} more`,
    };
  }

  if (currentCount > requiredCount) {
    return {
      ...cell,
      status: 'info',
      message: `${currentCount - requiredCount} extra`,
    };
  }

  return {
    ...cell,
    status: 'valid',
    message: undefined,
  };
};

/**
 * Validate all matrix cells and return validation result
 */
export const validateMatrix = (cells: MatrixCell[]): MatrixValidationResult => {
  const cellsStatus: MatrixCellStatus[] = cells.map((cell) => ({
    topicId: cell.topicId,
    difficulty: cell.difficulty,
    questionType: cell.questionType,
    required: cell.requiredCount,
    selected: cell.currentCount,
    requiredPoints: 0,
    selectedPoints: 0,
    isFulfilled: cell.currentCount >= cell.requiredCount,
  }));

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for unfulfilled cells
  const unfulfilled = cellsStatus.filter((s) => !s.isFulfilled && s.required > 0);
  if (unfulfilled.length > 0) {
    warnings.push(`${unfulfilled.length} cells need more questions`);
  }

  const fulfilledCells = cellsStatus.filter((s) => s.isFulfilled && s.required > 0).length;
  const partialCells = cellsStatus.filter((s) => s.selected > 0 && !s.isFulfilled).length;
  const emptyCells = cellsStatus.filter((s) => s.selected === 0 && s.required > 0).length;

  return {
    isValid: errors.length === 0,
    totalPoints: 0,
    targetPoints: 0,
    pointsDifference: 0,
    cellsStatus,
    errors,
    warnings,
    summary: {
      totalCells: cells.length,
      fulfilledCells,
      partialCells,
      emptyCells,
    },
  };
};

/**
 * Create initial matrix cells for a topic across all difficulties and question types
 */
export const createMatrixCellsForTopic = (
  topicId: string,
  topicName: string,
  difficulties: readonly ConstantItem<Difficulty>[],
  questionTypes: readonly ConstantItem<QuestionType>[]
): MatrixCell[] => {
  const cells: MatrixCell[] = [];

  difficulties.forEach((difficulty) => {
    questionTypes.forEach((questionType) => {
      cells.push({
        id: createCellId(topicId, difficulty.value, questionType.value),
        topicId,
        topicName,
        difficulty: difficulty.value,
        questionType: questionType.value,
        requiredCount: 0,
        currentCount: 0,
      });
    });
  });

  return cells;
};
