import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { Assignment as CoreAssignment, Submission } from '@aiprimary/core';
import type { AssignmentApiService, AssignmentCollectionRequest } from '../types/service';
import type { CreateAssignmentRequest, UpdateAssignmentRequest } from '../types';

export default class AssignmentService implements AssignmentApiService {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly baseUrl: string
  ) {}

  async getAssignments(request: AssignmentCollectionRequest): Promise<ApiResponse<CoreAssignment[]>> {
    const response = await this.apiClient.get(`${this.baseUrl}/api/assignments`, { params: request });
    return response.data;
  }

  async getAssignmentById(id: string): Promise<CoreAssignment> {
    const response = await this.apiClient.get(`${this.baseUrl}/api/assignments/${id}`);
    return response.data.data;
  }

  async createAssignment(data: CreateAssignmentRequest): Promise<CoreAssignment> {
    const response = await this.apiClient.post(`${this.baseUrl}/api/assignments`, data);
    return response.data.data;
  }

  async updateAssignment(id: string, data: UpdateAssignmentRequest): Promise<CoreAssignment> {
    const response = await this.apiClient.put(`${this.baseUrl}/api/assignments/${id}`, data);
    return response.data.data;
  }

  async deleteAssignment(id: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/assignments/${id}`);
  }

  async submitAssignment(assignmentId: string, submission: Submission): Promise<Submission> {
    const response = await this.apiClient.post(
      `${this.baseUrl}/api/assignments/${assignmentId}/submit`,
      submission
    );
    return response.data.data;
  }

  async getSubmission(assignmentId: string, studentId: string): Promise<Submission> {
    const response = await this.apiClient.get(
      `${this.baseUrl}/api/assignments/${assignmentId}/submissions/${studentId}`
    );
    return response.data.data;
  }
}
