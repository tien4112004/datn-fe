import type { AssessmentMatrix, Difficulty, QuestionType, SubjectCode } from '@aiprimary/core';
import type { Grade } from '@aiprimary/core/assessment/grades.js';
import {
  createCellId,
  createTopicId,
  parseCellValue,
  serializeCellValue,
  difficultyFromApi,
  questionTypeFromApi,
} from '@aiprimary/core';
import type { MatrixCell, ApiMatrix, AssignmentTopic, MatrixDimensionTopic } from '../types';

/**
 * Matrix Conversion Utilities
 *
 * Convert between 3D AssessmentMatrix (API format) and flat MatrixCell array (UI format)
 */

// ============================================================================
// API Conversion Functions
// ============================================================================

/**
 * Convert flat MatrixCell array to API matrix format.
 * Topics are the first dimension (no subtopic hierarchy).
 *
 * @param cells - Flat array of MatrixCell from UI
 * @param metadata - Matrix metadata (grade, subject)
 * @param topics - Store topics (topics with optional subtopics metadata)
 * @returns ApiMatrix with topics as first dimension
 */
export function cellsToApiMatrix(
  cells: MatrixCell[],
  metadata: {
    grade: Grade;
    subject: SubjectCode;
  },
  topics: AssignmentTopic[]
): ApiMatrix {
  // Extract unique difficulties and question types from cells
  const difficultiesSet = new Set<Difficulty>();
  const questionTypesSet = new Set<QuestionType>();

  cells.forEach((cell) => {
    difficultiesSet.add(cell.difficulty);
    questionTypesSet.add(cell.questionType);
  });

  const difficulties = Array.from(difficultiesSet);
  const questionTypes = Array.from(questionTypesSet);

  // Map topics directly (no grouping by parentTopic)
  const dimensionTopics: MatrixDimensionTopic[] = topics.map((t) => ({
    id: t.id,
    name: t.name,
    subtopics: t.subtopics, // Pass through informational subtopics
  }));

  // Build 3D matrix — rows are topics (not subtopics)
  const matrix: string[][][] = topics.map((topic) =>
    difficulties.map((difficulty) =>
      questionTypes.map((questionType) => {
        const cell = cells.find(
          (c) => c.topicId === topic.id && c.difficulty === difficulty && c.questionType === questionType
        );
        if (!cell || cell.requiredCount === 0) return '0:0';
        return `${cell.requiredCount}:${cell.requiredCount.toFixed(1)}`;
      })
    )
  );

  // Calculate totals
  let totalQuestions = 0;
  let totalPoints = 0;
  cells.forEach((cell) => {
    totalQuestions += cell.requiredCount;
    totalPoints += cell.requiredCount;
  });

  return {
    grade: metadata.grade,
    subject: metadata.subject,
    dimensions: {
      topics: dimensionTopics,
      difficulties,
      questionTypes,
    },
    matrix,
    totalQuestions,
    totalPoints,
  };
}

/**
 * Merge API matrix required counts into a full matrix cell grid.
 * Topics are already flat in new structure (no subtopic flattening needed).
 *
 * @param apiMatrix - Matrix from API (with flat topics)
 * @param fullCells - Full grid of MatrixCell (one per topic × difficulty × questionType)
 * @returns Updated cells with requiredCount from API
 */
export function mergeApiMatrixIntoCells(apiMatrix: ApiMatrix, fullCells: MatrixCell[]): MatrixCell[] {
  const { dimensions, matrix } = apiMatrix;

  // Topics are already flat in new structure
  dimensions.topics.forEach((topic, topicIdx) => {
    dimensions.difficulties.forEach((difficultyApi, diffIdx) => {
      dimensions.questionTypes.forEach((questionTypeApi, qtIdx) => {
        const cellValue = matrix[topicIdx]?.[diffIdx]?.[qtIdx] || '0:0';
        const { count } = parseCellValue(cellValue);

        const difficulty = difficultyFromApi(difficultyApi);
        const questionType = questionTypeFromApi(questionTypeApi);

        const cell = fullCells.find(
          (c) => c.topicId === topic.id && c.difficulty === difficulty && c.questionType === questionType
        );

        if (cell) {
          cell.requiredCount = count;
        }
      });
    });
  });

  // Filter out cells with requiredCount = 0
  return fullCells.filter((cell) => cell.requiredCount > 0);
}

/**
 * Convert ApiMatrix to flat MatrixCell array + AssignmentTopic array for viewer.
 * Topics are already flat (no parentTopic grouping).
 */
export function apiMatrixToViewData(
  apiMatrix: ApiMatrix,
  questions?: { question: { topicId?: string; difficulty?: string; type?: string } }[]
): {
  topics: AssignmentTopic[];
  cells: MatrixCell[];
} {
  const { dimensions, matrix } = apiMatrix;

  // Topics are already flat - just map to AssignmentTopic
  const topics: AssignmentTopic[] = dimensions.topics.map((topic) => ({
    id: topic.id || createTopicId(),
    name: topic.name,
    subtopics: topic.subtopics, // Carry over informational data
  }));

  // Count questions per cell if questions are provided
  const counts = new Map<string, number>();
  if (questions?.length) {
    questions.forEach((aq) => {
      const q = aq.question;
      if (q.topicId && q.difficulty && q.type) {
        const key = createCellId(q.topicId, difficultyFromApi(q.difficulty), questionTypeFromApi(q.type));
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    });
  }

  const cells: MatrixCell[] = [];
  dimensions.topics.forEach((topic, topicIdx) => {
    dimensions.difficulties.forEach((difficultyRaw, diffIdx) => {
      dimensions.questionTypes.forEach((questionTypeRaw, qtIdx) => {
        const cellValue = matrix[topicIdx]?.[diffIdx]?.[qtIdx] || '0:0';
        const { count, points } = parseCellValue(cellValue);

        const difficulty = difficultyFromApi(difficultyRaw);
        const questionType = questionTypeFromApi(questionTypeRaw);
        const cellId = createCellId(topic.id || '', difficulty, questionType);

        cells.push({
          id: cellId,
          topicId: topic.id || '',
          topicName: topic.name,
          difficulty,
          questionType,
          requiredCount: count,
          currentCount: counts.get(cellId) || 0,
          points,
        });
      });
    });
  });

  return { topics, cells };
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
          id: createCellId(topic.id, difficulty, questionType),
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

// Re-export from core for backwards compatibility
export { createCellId, parseCellId } from '@aiprimary/core';
