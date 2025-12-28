import type { ExamMatrix, Topic, SubjectCode } from './index';

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
  getMatrixById(id: string): Promise<ExamMatrix>;
  createMatrix(data: CreateExamMatrixRequest): Promise<ExamMatrix>;
  updateMatrix(id: string, data: UpdateExamMatrixRequest): Promise<ExamMatrix>;

  // Topic management
  getTopicsBySubject(subjectCode: SubjectCode): Promise<Topic[]>;
  createTopic(data: CreateTopicRequest): Promise<Topic>;
  updateTopic(id: string, data: UpdateTopicRequest): Promise<Topic>;
  deleteTopic(id: string): Promise<void>;
}
