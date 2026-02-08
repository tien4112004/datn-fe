import { DIFFICULTY } from '../types';
import type { AssignmentTopic, AssignmentQuestionWithTopic, MatrixCell, AssignmentContext } from '../types';
import type { Assignment } from '@aiprimary/core';
import { transformQuestionsFromApi } from './questionTransform';

export interface AssignmentFormInitData {
  title: string;
  description: string;
  subject: string;
  grade: string;
  shuffleQuestions: boolean;
  topics: AssignmentTopic[];
  questions: AssignmentQuestionWithTopic[];
  matrixCells: MatrixCell[];
  contexts?: AssignmentContext[];
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
    questions: [],
    matrixCells: createDefaultMatrixCells(topic.id),
  };
}

export function transformAssignmentToFormData(assignment: Assignment): AssignmentFormInitData {
  const extendedAssignment = assignment as typeof assignment & {
    subject?: string;
    grade?: string;
  };

  const topic = createDefaultTopic();
  const backendQuestions = (extendedAssignment.questions || []) as unknown as any[];
  const transformedQuestions = transformQuestionsFromApi(backendQuestions, topic.id);

  return {
    title: extendedAssignment.title || 'Untitled Assignment',
    description: extendedAssignment.description || '',
    subject: extendedAssignment.subject || '',
    grade: extendedAssignment.grade || '',
    shuffleQuestions: extendedAssignment.shuffleQuestions || false,
    topics: [topic],
    questions: transformedQuestions,
    matrixCells: createDefaultMatrixCells(topic.id),
  };
}
