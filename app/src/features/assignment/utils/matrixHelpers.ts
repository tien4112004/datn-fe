import type { MatrixCell, MatrixCellWithValidation, Difficulty } from '../types';
import type { ConstantItem } from '@aiprimary/core';

/**
 * Validate a single matrix cell and return validation status
 */
export const validateMatrixCell = (cell: MatrixCell): MatrixCellWithValidation => {
  const { currentCount, requiredCount } = cell;

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
 * Validate all matrix cells
 */
export const validateMatrix = (cells: MatrixCell[]): MatrixCellWithValidation[] => {
  return cells.map(validateMatrixCell);
};

/**
 * Create initial matrix cells for a topic across all difficulties
 */
export const createMatrixCellsForTopic = (
  topicId: string,
  difficulties: readonly ConstantItem<Difficulty>[]
): MatrixCell[] => {
  return difficulties.map((difficulty, index) => ({
    id: `${topicId}-${difficulty.value}-${Date.now()}-${index}`,
    topicId,
    difficulty: difficulty.value,
    requiredCount: 0,
    currentCount: 0,
  }));
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
