import type { SubjectCode } from '@aiprimary/core';
import type { Grade } from '@aiprimary/core/assessment/grades.js';

// Re-export domain types from core
export type {
  AssignmentContext,
  AssignmentTopic,
  QuestionWithTopic,
  AssignmentQuestionWithTopic,
  ApiMatrix,
  MatrixCell,
  MatrixCellWithValidation,
  Assignment,
} from '@aiprimary/core';

// Re-export core types for convenience
export type {
  AssessmentMatrix,
  MatrixMetadata,
  MatrixDimensions,
  MatrixDimensionTopic,
  MatrixCellStatus,
  MatrixValidationResult,
  ExamDraft as ExamDraftDto,
  MatrixGapDto,
} from '@aiprimary/core';

// App-specific types below

// Assignment form data (used by react-hook-form)
export interface AssignmentFormData {
  title: string;
  description?: string;
  subject: string;
  grade?: string;
  topics: import('@aiprimary/core').AssignmentTopic[];
  contexts: import('@aiprimary/core').AssignmentContext[];
  questions: import('@aiprimary/core').AssignmentQuestionWithTopic[];
  matrix: import('@aiprimary/core').MatrixCell[];
}

// Validation errors for the assignment editor form
export interface AssignmentValidationErrors {
  assignment: {
    title?: string;
    subject?: string;
  };
  questions: Record<string, { errors: string[]; warnings: string[] }>;
  matrix?: { errors: string[] };
}

// Question item for API request (flat structure matching backend)
export interface QuestionItemRequest {
  id: string;
  type: string;
  difficulty: string;
  title: string;
  titleImageUrl?: string;
  explanation?: string;
  grade?: Grade;
  chapter?: string;
  subject?: SubjectCode;
  data: unknown;
  point: number;
  topicId?: string;
}

// Topic for API request
export interface TopicRequest {
  id: string;
  name: string;
  description?: string;
  hasContext?: boolean;
}

// API request types
export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  subject: SubjectCode;
  grade?: Grade;
  questions?: QuestionItemRequest[];
  topics?: TopicRequest[];
  contexts?: import('@aiprimary/core').AssignmentContext[];
  matrix?: import('@aiprimary/core').ApiMatrix;
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  subject?: SubjectCode;
  grade?: Grade;
  questions?: QuestionItemRequest[];
  topics?: TopicRequest[];
  contexts?: import('@aiprimary/core').AssignmentContext[];
  matrix?: import('@aiprimary/core').ApiMatrix;
}

// Generate matrix request (calls POST /api/exams/generate-matrix)
export interface GenerateMatrixRequest {
  name: string;
  grade: string;
  subject: string;
  totalQuestions: number;
  totalPoints: number;
  difficulties?: string[];
  questionTypes?: string[];
  prompt?: string;
  language?: string;
  provider?: string;
  model?: string;
}

// Generate matrix response
export interface GenerateMatrixResponse {
  metadata: {
    id: string;
    name: string;
    grade: string;
    subject: string;
    createdAt: string;
  };
  dimensions: {
    topics: Array<{
      id: string;
      name: string;
      subtopics: Array<{ id: string; name: string }>;
    }>;
    difficulties: string[];
    questionTypes: string[];
  };
  matrix: string[][][];
  totalQuestions: number;
  totalPoints: number;
}

// Generate exam from matrix - Request
export interface GenerateExamFromMatrixRequest {
  matrixId?: string;
  matrix?: import('@aiprimary/core').ApiMatrix;
  subject: string;
  title: string;
  description?: string;
  missingStrategy?: 'REPORT_GAPS' | 'GENERATE_WITH_AI' | 'FAIL_FAST';
  includePersonalQuestions?: boolean;
  provider?: string;
  model?: string;
}
