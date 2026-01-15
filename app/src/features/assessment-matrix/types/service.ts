import type { AssessmentMatrix, Topic, SubjectCode } from './index';

/**
 * Request payload for creating a new exam matrix
 */
export interface CreateAssessmentMatrixRequest {
  matrix: Omit<AssessmentMatrix, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Request payload for updating an existing exam matrix
 */
export interface UpdateAssessmentMatrixRequest {
  matrix: Partial<AssessmentMatrix>;
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
 * Assessment Matrix API Service Interface
 * Defines all operations for managing exam matrices
 */
export interface AssessmentMatrixApiService {
  // Matrix CRUD
  getMatrixById(id: string): Promise<AssessmentMatrix>;
  createMatrix(data: CreateAssessmentMatrixRequest): Promise<AssessmentMatrix>;
  updateMatrix(id: string, data: UpdateAssessmentMatrixRequest): Promise<AssessmentMatrix>;

  // Topic management
  getTopicsBySubject(subjectCode: SubjectCode): Promise<Topic[]>;
  createTopic(data: CreateTopicRequest): Promise<Topic>;
  updateTopic(id: string, data: UpdateTopicRequest): Promise<Topic>;
  deleteTopic(id: string): Promise<void>;
}
