import type {
  ExamMatrix,
  Topic,
  ExamMatrixFilters,
  ExamMatrixResponse,
  MatrixValidationResult,
  SubjectCode,
} from './index';

/**
 * Request payload for creating a new exam matrix
 */
export interface CreateExamMatrixRequest {
  matrix: Omit<ExamMatrix, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Request payload for updating an existing exam matrix
 */
export interface UpdateExamMatrixRequest {
  matrix: Partial<ExamMatrix>;
}

/**
 * Request payload for validating matrix compliance
 */
export interface ValidateMatrixRequest {
  matrixId: string;
  questionSelections: Record<string, string>; // questionId -> cellId mapping
}

/**
 * Request payload for creating a new topic
 */
export interface CreateTopicRequest {
  topic: Omit<Topic, 'id'>;
}

/**
 * Request payload for updating a topic
 */
export interface UpdateTopicRequest {
  topic: Partial<Topic>;
}

/**
 * Exam Matrix API Service Interface
 * Defines all operations for managing exam matrices
 */
export interface ExamMatrixApiService {
  // Matrix CRUD
  getMatrices(filters?: ExamMatrixFilters): Promise<ExamMatrixResponse>;
  getMatrixById(id: string): Promise<ExamMatrix>;
  createMatrix(data: CreateExamMatrixRequest): Promise<ExamMatrix>;
  updateMatrix(id: string, data: UpdateExamMatrixRequest): Promise<ExamMatrix>;
  deleteMatrix(id: string): Promise<void>;
  deleteMatrices(ids: string[]): Promise<void>;

  // Matrix utilities
  duplicateMatrix(id: string): Promise<ExamMatrix>;
  validateMatrix(data: ValidateMatrixRequest): Promise<MatrixValidationResult>;
  exportMatrices(filters?: ExamMatrixFilters): Promise<Blob>;
  importMatrices(file: File): Promise<{ success: number; failed: number }>;

  // Topic management
  getTopicsBySubject(subjectCode: SubjectCode): Promise<Topic[]>;
  createTopic(data: CreateTopicRequest): Promise<Topic>;
  updateTopic(id: string, data: UpdateTopicRequest): Promise<Topic>;
  deleteTopic(id: string): Promise<void>;
}
