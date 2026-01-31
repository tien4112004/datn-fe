import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { Submission, Answer } from '@aiprimary/core';

export interface SubmissionCreateRequest {
  postId: string;
  answers: Answer[];
}

export interface SubmissionGradeRequest {
  questionScores: Record<string, number>; // questionId -> score mapping
  overallFeedback?: string;
}

export interface SubmissionApiService {
  createSubmission(request: SubmissionCreateRequest): Promise<Submission>;
  getSubmissionsByPost(postId: string): Promise<Submission[]>;
  getSubmissionById(submissionId: string): Promise<Submission>;
  gradeSubmission(submissionId: string, request: SubmissionGradeRequest): Promise<Submission>;
  deleteSubmission(submissionId: string): Promise<void>;
}

export default class SubmissionService implements SubmissionApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async createSubmission(request: SubmissionCreateRequest): Promise<Submission> {
    const response = await this.apiClient.post<ApiResponse<Submission>>(
      `${this.baseUrl}/api/posts/${request.postId}/submissions`,
      {
        questions: request.answers, // Backend expects 'questions' field
      }
    );

    return response.data.data;
  }

  async getSubmissionsByPost(postId: string): Promise<Submission[]> {
    const response = await this.apiClient.get<ApiResponse<Submission[]>>(
      `${this.baseUrl}/api/posts/${postId}/submissions`
    );

    return response.data.data;
  }

  async getSubmissionById(submissionId: string): Promise<Submission> {
    const response = await this.apiClient.get<ApiResponse<Submission>>(
      `${this.baseUrl}/api/submissions/${submissionId}`
    );

    return response.data.data;
  }

  async gradeSubmission(submissionId: string, request: SubmissionGradeRequest): Promise<Submission> {
    const response = await this.apiClient.put<ApiResponse<Submission>>(
      `${this.baseUrl}/api/submissions/${submissionId}/grade`,
      request
    );

    return response.data.data;
  }

  async deleteSubmission(submissionId: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/submissions/${submissionId}`);
  }
}
