import type { Difficulty, SubjectCode } from './';
import type { Question } from '@aiprimary/core';

// Question with topic assignment (intersection of core Question with topicId)
export type QuestionWithTopic = Question & {
  topicId: string;
};

// Assignment Question with topic assignment
export type AssignmentQuestionWithTopic = {
  question: QuestionWithTopic;
  points: number;
};

// Assignment topic
export interface AssignmentTopic {
  id: string;
  name: string;
  description?: string;
}

// Matrix cell (topic × difficulty)
export interface MatrixCell {
  id: string;
  topicId: string;
  difficulty: Difficulty;
  requiredCount: number;
  currentCount: number;
}

// Matrix cell with validation
export interface MatrixCellWithValidation extends MatrixCell {
  status: 'valid' | 'warning' | 'info';
  message?: string;
}

// Assignment form data (used by react-hook-form)
export interface AssignmentFormData {
  title: string;
  description?: string;
  subject: string;
  grade?: string;
  topics: AssignmentTopic[];
  questions: AssignmentQuestionWithTopic[];
  matrixCells: MatrixCell[];
  shuffleQuestions?: boolean; // Shuffle questions for each student (default: false)
}

// Assignment (full entity)
export interface Assignment {
  id: string;
  title: string;
  description?: string;
  subject?: SubjectCode;
  topics: AssignmentTopic[];
  questions: AssignmentQuestionWithTopic[];
  matrix: {
    cells: MatrixCell[];
  };
  totalPoints?: number; // Total points for the assignment
  shuffleQuestions?: boolean; // Shuffle questions for each student (default: false)
  status: 'draft' | 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

// Question item for API request (flat structure matching backend)
export interface QuestionItemRequest {
  id: string;
  type: string;
  difficulty: string;
  title: string;
  titleImageUrl?: string;
  explanation?: string;
  grade?: string;
  chapter?: string;
  subject?: string;
  data: unknown;
  point: number;
}

// Matrix cell for API request
export interface MatrixCellRequest {
  topicId: string;
  difficulty: string;
  requiredCount: number;
}

// Topic for API request
export interface TopicRequest {
  id: string;
  name: string;
  description?: string;
}

// API request types
export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  subject: string;
  grade?: string;
  questions?: QuestionItemRequest[];
  topics?: TopicRequest[];
  matrixCells?: MatrixCellRequest[];
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  subject?: string;
  grade?: string;
  questions?: QuestionItemRequest[];
  topics?: TopicRequest[];
  matrixCells?: MatrixCellRequest[];
}
