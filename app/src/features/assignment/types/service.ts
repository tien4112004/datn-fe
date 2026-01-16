import type { ApiResponse } from '@aiprimary/api';
import type { Assignment as CoreAssignment, Submission } from '@aiprimary/core';
import type { CreateAssignmentRequest, UpdateAssignmentRequest } from './assignment';

export interface AssignmentCollectionRequest {
  page?: number;
  pageSize?: number;
  classId?: string;
  sort?: 'asc' | 'desc';
  filter?: string;
}

export interface AssignmentApiService {
  // CRUD operations
  getAssignments(request: AssignmentCollectionRequest): Promise<ApiResponse<CoreAssignment[]>>;
  getAssignmentById(id: string): Promise<CoreAssignment>;
  createAssignment(data: CreateAssignmentRequest): Promise<CoreAssignment>;
  updateAssignment(id: string, data: UpdateAssignmentRequest): Promise<CoreAssignment>;
  deleteAssignment(id: string): Promise<void>;

  // Submission operations
  submitAssignment(assignmentId: string, submission: Submission): Promise<Submission>;
  getSubmission(assignmentId: string, studentId: string): Promise<Submission>;
}
