import {
  type Assignment,
  type AssignmentTopic,
  type AssignmentQuestionWithTopic,
  type MatrixCell,
  type AssignmentContext,
  DIFFICULTY,
  QUESTION_TYPE,
} from '../types';
import { createMatrixCellsForTopic } from './matrixHelpers';

export interface AssignmentFormInitData {
  title: string;
  description: string;
  subject: string;
  grade: string;
  shuffleQuestions: boolean;
  topics: AssignmentTopic[];
  questions: AssignmentQuestionWithTopic[];
  matrixCells: MatrixCell[];
  contexts: AssignmentContext[];
}

export function createDefaultTopic(): AssignmentTopic {
  const ts = Date.now();
  return {
    id: `topic-${ts}`,
    name: 'General',
    description: '',
  };
}

const difficulties = Object.values(DIFFICULTY);
const questionTypes = Object.values(QUESTION_TYPE);

export function createEmptyFormData(): AssignmentFormInitData {
  const topic = createDefaultTopic();
  return {
    title: 'Untitled Assignment',
    description: '',
    subject: '',
    grade: '',
    shuffleQuestions: false,
    topics: [topic],
    contexts: [],
    questions: [],
    matrixCells: createMatrixCellsForTopic(topic.id, topic.name, difficulties, questionTypes),
  };
}

export function transformAssignmentToFormData(assignment: Assignment): AssignmentFormInitData {
  const extendedAssignment = assignment as typeof assignment & {
    subject?: string;
    grade?: string;
    matrix?: { cells: MatrixCell[] };
  };

  // Use existing topics from the assignment, fall back to a default topic
  const topics =
    extendedAssignment.topics && extendedAssignment.topics.length > 0
      ? extendedAssignment.topics
      : [createDefaultTopic()];

  // Questions are already in nested { question, points } format from the service.
  // Preserve topicId, contextId, and all other fields as-is.
  const questions = (extendedAssignment.questions || []) as AssignmentQuestionWithTopic[];

  // Use existing matrix cells from the assignment, fall back to defaults
  const matrixCells =
    extendedAssignment.matrix?.cells && extendedAssignment.matrix.cells.length > 0
      ? extendedAssignment.matrix.cells
      : createMatrixCellsForTopic(topics[0].id, topics[0].name, difficulties, questionTypes);

  return {
    title: extendedAssignment.title || 'Untitled Assignment',
    description: extendedAssignment.description || '',
    subject: extendedAssignment.subject || '',
    grade: extendedAssignment.grade || '',
    shuffleQuestions: extendedAssignment.shuffleQuestions || false,
    topics,
    contexts: assignment.contexts || [],
    questions,
    matrixCells,
  };
}
