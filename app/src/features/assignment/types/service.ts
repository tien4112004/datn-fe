import type { Service } from '@/shared/api';
import type { ApiResponse } from '@aiprimary/api';
import type { Assignment, Submission, Question } from '@aiprimary/core';

export interface AssignmentCollectionRequest {
  page?: number;
  pageSize?: number;
  classId?: string;
  sort?: 'asc' | 'desc';
  filter?: string;
}

export interface CreateAssignmentRequest {
  classId: string;
  title: string;
  description?: string;
  questions: Question[];
  dueDate?: string;
  totalPoints?: number;
}

export interface UpdateAssignmentRequest extends Partial<CreateAssignmentRequest> {
  id: string;
}

export interface AssignmentApiService extends Service {
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
