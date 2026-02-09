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
 * Convert flat MatrixCell array to API matrix format with topic > subtopic hierarchy.
 *
 * @param cells - Flat array of MatrixCell from UI
 * @param metadata - Matrix metadata (grade, subject)
 * @param topics - Store topics (subtopics with optional parentTopic grouping)
 * @returns ApiMatrix with topic > subtopic dimensions
 */
export function cellsToApiMatrix(
  cells: MatrixCell[],
  metadata: {
    grade: Grade;
    subject: SubjectCode;
  },
  topics: AssignmentTopic[]
): ApiMatrix {
  // Extract unique dimensions from cells
  const subtopicsMap = new Map<string, { id: string; name: string }>();
  const difficultiesSet = new Set<Difficulty>();
  const questionTypesSet = new Set<QuestionType>();

  cells.forEach((cell) => {
    if (!subtopicsMap.has(cell.topicId)) {
      subtopicsMap.set(cell.topicId, { id: cell.topicId, name: cell.topicName });
    }
    difficultiesSet.add(cell.difficulty);
    questionTypesSet.add(cell.questionType);
  });

  const difficulties = Array.from(difficultiesSet);
  const questionTypes = Array.from(questionTypesSet);

  // Build topic > subtopic hierarchy from store topics
  const groupMap = new Map<string, { id: string; name: string }[]>();
  const groupOrder: string[] = [];
  topics.forEach((t) => {
    const group = t.parentTopic || t.name;
    if (!groupMap.has(group)) {
      groupMap.set(group, []);
      groupOrder.push(group);
    }
    groupMap.get(group)!.push({ id: t.id, name: t.name });
  });
  const dimensionTopics: MatrixDimensionTopic[] = groupOrder.map((name) => ({
    name,
    subtopics: groupMap.get(name)!,
  }));

  // Build 3D matrix — rows are flattened subtopics in group order
  const orderedSubtopics = dimensionTopics.flatMap((t) => t.subtopics);
  const matrix: string[][][] = orderedSubtopics.map((subtopic) =>
    difficulties.map((difficulty) =>
      questionTypes.map((questionType) => {
        const cell = cells.find(
          (c) => c.topicId === subtopic.id && c.difficulty === difficulty && c.questionType === questionType
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
 * Flattens topic > subtopic hierarchy to match matrix row indexing.
 *
 * @param apiMatrix - Matrix from API (with topic > subtopic dimensions)
 * @param fullCells - Full grid of MatrixCell (one per subtopic × difficulty × questionType)
 * @returns Updated cells with requiredCount from API
 */
export function mergeApiMatrixIntoCells(apiMatrix: ApiMatrix, fullCells: MatrixCell[]): MatrixCell[] {
  const { dimensions, matrix } = apiMatrix;

  // Flatten subtopics — matrix rows correspond to flattened subtopics
  const flatSubtopics = dimensions.topics.flatMap((t) => t.subtopics ?? []);

  // Ensure all subtopics have IDs
  flatSubtopics.forEach((sub) => {
    if (!sub.id) {
      sub.id = createTopicId();
    }
  });

  // Create a map for quick lookup by subtopic index
  const cellsBySubtopicIndex = new Map<number, MatrixCell[]>();
  fullCells.forEach((cell) => {
    const subIdx = flatSubtopics.findIndex((s) => s.id === cell.topicId);
    if (subIdx >= 0) {
      if (!cellsBySubtopicIndex.has(subIdx)) {
        cellsBySubtopicIndex.set(subIdx, []);
      }
      cellsBySubtopicIndex.get(subIdx)!.push(cell);
    }
  });

  // Update requiredCount from API matrix
  flatSubtopics.forEach((_, subIdx) => {
    const subCells = cellsBySubtopicIndex.get(subIdx) || [];

    dimensions.difficulties.forEach((difficultyApi, diffIdx) => {
      dimensions.questionTypes.forEach((questionTypeApi, qtIdx) => {
        const cellValue = matrix[subIdx]?.[diffIdx]?.[qtIdx] || '0:0';
        const { count } = parseCellValue(cellValue);

        const difficulty = difficultyFromApi(difficultyApi);
        const questionType = questionTypeFromApi(questionTypeApi);

        const cell = subCells.find((c) => c.difficulty === difficulty && c.questionType === questionType);
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
 * Handles the 3D matrix → flat cells conversion and extracts topic hierarchy.
 */
export function apiMatrixToViewData(
  apiMatrix: ApiMatrix,
  questions?: { question: { topicId?: string; difficulty?: string; type?: string } }[]
): {
  topics: AssignmentTopic[];
  cells: MatrixCell[];
} {
  const { dimensions, matrix } = apiMatrix;

  // Build topics with parentTopic grouping from dimension hierarchy
  const topics: AssignmentTopic[] = dimensions.topics.flatMap((topic) =>
    (topic.subtopics ?? [])
      .filter((sub) => sub.name?.trim())
      .map((sub) => ({
        id: sub.id || createTopicId(),
        name: sub.name,
        parentTopic: topic.name,
      }))
  );

  // Flatten subtopics in order matching matrix row indices
  const flatSubtopics = dimensions.topics.flatMap((t) => t.subtopics ?? []);

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
  flatSubtopics.forEach((sub, subIdx) => {
    dimensions.difficulties.forEach((difficultyRaw, diffIdx) => {
      dimensions.questionTypes.forEach((questionTypeRaw, qtIdx) => {
        const cellValue = matrix[subIdx]?.[diffIdx]?.[qtIdx] || '0:0';
        const { count, points } = parseCellValue(cellValue);

        const difficulty = difficultyFromApi(difficultyRaw);
        const questionType = questionTypeFromApi(questionTypeRaw);
        const cellId = createCellId(sub.id || '', difficulty, questionType);

        cells.push({
          id: cellId,
          topicId: sub.id || '',
          topicName: sub.name,
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
