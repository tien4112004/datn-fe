import { DIFFICULTY } from '../types';
import type {
  Assignment,
  AssignmentTopic,
  AssignmentQuestionWithTopic,
  MatrixCell,
  AssignmentContext,
} from '../types';

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

export function createDefaultMatrixCells(topicId: string): MatrixCell[] {
  const ts = Date.now();
  return [
    { id: `cell-${ts}-1`, topicId, difficulty: DIFFICULTY.KNOWLEDGE, requiredCount: 0, currentCount: 0 },
    { id: `cell-${ts}-2`, topicId, difficulty: DIFFICULTY.COMPREHENSION, requiredCount: 0, currentCount: 0 },
    { id: `cell-${ts}-3`, topicId, difficulty: DIFFICULTY.APPLICATION, requiredCount: 0, currentCount: 0 },
    {
      id: `cell-${ts}-4`,
      topicId,
      difficulty: DIFFICULTY.ADVANCED_APPLICATION,
      requiredCount: 0,
      currentCount: 0,
    },
  ];
}

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
    matrixCells: createDefaultMatrixCells(topic.id),
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
      : createDefaultMatrixCells(topics[0].id);

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
