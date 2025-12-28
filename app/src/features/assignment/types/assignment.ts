import type { Difficulty, QuestionType, SubjectCode } from './constants';
import type { Question } from '@aiprimary/core';

// Base question interface (for forms that don't need full question data)
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  title: string;
  explanation?: string;
  points?: number;
}

// Question with topic assignment (intersection of core Question with topicId)
export type QuestionWithTopic = Question & {
  topicId: string;
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
  topics: AssignmentTopic[];
  questions: QuestionWithTopic[];
  matrixCells: MatrixCell[];
}

// Assignment (full entity)
export interface Assignment {
  id: string;
  classId?: string; // Class this assignment belongs to (optional for drafts)
  title: string;
  description?: string;
  subject: string;
  subjectCode?: SubjectCode;
  topics: AssignmentTopic[];
  questions: QuestionWithTopic[];
  matrix: {
    cells: MatrixCell[];
  };
  dueDate?: string; // ISO timestamp for assignment due date
  totalPoints?: number; // Total points for the assignment
  status: 'draft' | 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// API request types
export interface CreateAssignmentRequest {
  classId?: string;
  title: string;
  description?: string;
  subject: string;
  topics?: AssignmentTopic[];
  questions?: QuestionWithTopic[];
  matrixCells?: MatrixCell[];
  dueDate?: string;
  totalPoints?: number;
}

export interface UpdateAssignmentRequest {
  id?: string;
  title?: string;
  description?: string;
  dueDate?: string;
  questions?: QuestionWithTopic[];
  totalPoints?: number;
}
