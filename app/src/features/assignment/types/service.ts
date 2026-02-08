import type { ApiResponse } from '@aiprimary/api';
import type { Submission } from '@aiprimary/core';
import type { Assignment, CreateAssignmentRequest, UpdateAssignmentRequest } from './assignment';

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
  createAssignment(data: CreateAssignmentRequest): Promise<Assignment>;
  updateAssignment(id: string, data: UpdateAssignmentRequest): Promise<Assignment>;
  deleteAssignment(id: string): Promise<void>;

  // Submission operations
  submitAssignment(assignmentId: string, submission: Submission): Promise<Submission>;
  getSubmission(assignmentId: string, studentId: string): Promise<Submission>;
}
