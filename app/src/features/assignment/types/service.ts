import type { ApiResponse } from '@aiprimary/api';
import type { Submission } from '@aiprimary/core';
import type {
  Assignment,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  GenerateMatrixRequest,
  GenerateMatrixResponse,
} from './assignment';

export interface AssignmentCollectionRequest {
  page?: number;
  size?: number;
  classId?: string;
  sort?: 'asc' | 'desc';
  search?: string;
}

export interface AssignmentApiService {
  // CRUD operations
  getAssignments(request: AssignmentCollectionRequest): Promise<ApiResponse<Assignment[]>>;
  getAssignmentById(id: string): Promise<Assignment>;
  getAssignmentByIdPublic(id: string): Promise<Assignment>;
  getAssignmentByPostId(postId: string): Promise<Assignment>;
  createAssignment(data: CreateAssignmentRequest): Promise<Assignment>;
  updateAssignment(id: string, data: UpdateAssignmentRequest): Promise<Assignment>;
  deleteAssignment(id: string): Promise<void>;
  // Submission operations
  submitAssignment(assignmentId: string, submission: Submission): Promise<Submission>;
  getSubmission(assignmentId: string, studentId: string): Promise<Submission>;

  // Generation operations
  generateMatrix(request: GenerateMatrixRequest): Promise<GenerateMatrixResponse>;
}
