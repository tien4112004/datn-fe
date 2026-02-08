import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { Submission } from '@aiprimary/core';
import type { AssignmentApiService, AssignmentCollectionRequest } from '../types/service';
import type { Assignment, CreateAssignmentRequest, UpdateAssignmentRequest } from '../types';

export default class AssignmentService implements AssignmentApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async getAssignments(request: AssignmentCollectionRequest): Promise<ApiResponse<Assignment[]>> {
    const response = await this.apiClient.get(`${this.baseUrl}/api/assignments`, { params: request });
    return response.data;
  }

  async getAssignmentById(id: string): Promise<Assignment> {
    const response = await this.apiClient.get(`${this.baseUrl}/api/assignments/${id}`);
    const assignment = response.data.data;

    // Normalize questions from flat API format to nested { question, points } structure
    if (assignment.questions) {
      assignment.questions = assignment.questions.map((q: any) => {
        // Already in nested format { question: {...}, points }
        if (q.question?.id) {
          return {
            question: q.question,
            points: q.points ?? q.point ?? 0,
          };
        }
        // Flat format from API — wrap into nested structure
        const { points, point, ...questionData } = q;
        return {
          question: questionData,
          points: points ?? point ?? 0,
        };
      });
    }

    return assignment;
  }

  async createAssignment(data: CreateAssignmentRequest): Promise<Assignment> {
    const response = await this.apiClient.post(`${this.baseUrl}/api/assignments`, data);
    return response.data.data;
  }

  async updateAssignment(id: string, data: UpdateAssignmentRequest): Promise<Assignment> {
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
