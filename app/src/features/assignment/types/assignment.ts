import type { Difficulty, QuestionType, SubjectCode, AssignmentQuestion } from '@aiprimary/core';
import type { Question } from '@aiprimary/core';
import type { Grade } from '@aiprimary/core/assessment/grades.js';

// Context stored at assignment level (cloned & editable)
export interface AssignmentContext {
  id: string; // Local ID within assignment
  title: string;
  content: string;
  author?: string; // Author of the reading passage
}

// Question with topic assignment (intersection of core Question with topicId)
export type QuestionWithTopic = Question & {
  topicId: string;
  contextId?: string; // References AssignmentContext.id within the assignment
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
  parentTopic?: string; // Parent topic name for matrix grouping
}

// Matrix dimension topic (topic > subtopic hierarchy for API)
export interface MatrixDimensionTopic {
  name: string;
  subtopics: { id: string; name: string }[];
}

// Matrix cell (topic × difficulty × questionType) - flat representation for UI
export interface MatrixCell {
  id: string; // e.g., "topicId-difficulty-questionType"
  topicId: string;
  topicName: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  requiredCount: number;
  currentCount: number;
  points?: number;
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
  contexts: AssignmentContext[];
  questions: AssignmentQuestionWithTopic[];
  matrix: MatrixCell[];
  shuffleQuestions?: boolean; // Shuffle questions for each student (default: false)
}

// Assignment (full entity)
export interface Assignment {
  id: string;
  title: string;
  description?: string;
  subject?: SubjectCode;
  grade?: Grade;
  topics?: AssignmentTopic[];
  contexts?: AssignmentContext[];
  questions?: (AssignmentQuestion | AssignmentQuestionWithTopic)[];
  matrix?: ApiMatrix;
  totalPoints?: number;
  shuffleQuestions?: boolean;
  createdAt?: string;
  updatedAt?: string;
  maxSubmissions?: number;
  allowRetake?: boolean;
  showCorrectAnswers?: boolean;
  showScoreImmediately?: boolean;
  passingScore?: number;
  availableFrom?: string;
  availableUntil?: string;
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
}

// Matrix structure for API requests/responses
export interface ApiMatrix {
  grade: Grade;
  subject: SubjectCode;
  dimensions: {
    topics: MatrixDimensionTopic[];
    difficulties: Difficulty[];
    questionTypes: QuestionType[];
  };
  matrix: string[][][]; // "count:points" format, e.g., "3:3.0"
  totalQuestions: number;
  totalPoints: number;
}

// Validation errors for the assignment editor form
export interface AssignmentValidationErrors {
  /** Assignment-level field errors */
  assignment: {
    title?: string;
    subject?: string;
  };
  /** Per-question validation results, keyed by question ID */
  questions: Record<string, { errors: string[]; warnings: string[] }>;
  /** Matrix validation errors */
  matrix?: { errors: string[] };
}

// API request types
export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  subject: SubjectCode;
  grade?: Grade;
  questions?: QuestionItemRequest[];
  topics?: TopicRequest[];
  contexts?: AssignmentContext[];
  matrix?: ApiMatrix; // Full 3D matrix structure with lowercase enums
  shuffleQuestions?: boolean;
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  subject?: SubjectCode;
  grade?: Grade;
  questions?: QuestionItemRequest[];
  topics?: TopicRequest[];
  contexts?: AssignmentContext[];
  matrix?: ApiMatrix; // Full 3D matrix structure with lowercase enums
  shuffleQuestions?: boolean;
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
  additionalRequirements?: string;
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
  matrix: string[][][]; // "count:points" format
  totalQuestions: number;
  totalPoints: number;
}

// Re-export core types for convenience
// Note: MatrixDimensionTopic is defined locally above, so not re-exported from core
export type {
  AssessmentMatrix,
  MatrixMetadata,
  MatrixDimensions,
  MatrixCellStatus,
  MatrixValidationResult,
} from '@aiprimary/core';
