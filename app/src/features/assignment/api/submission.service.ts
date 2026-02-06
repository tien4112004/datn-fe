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

/**
 * Transform frontend Answer format to backend AnswerDataDto format
 * Frontend: { questionId, type, selectedOptionId/blanks/matches/text }
 * Backend: { id, type, answer: { type, id/blankAnswers/matchedPairs/response } }
 * Note: The type field is included in both parent and nested answer for Jackson polymorphic deserialization
 */
function transformAnswerToDto(answer: Answer): any {
  switch (answer.type) {
    case 'MULTIPLE_CHOICE':
      return {
        id: answer.questionId,
        type: answer.type,
        answer: {
          type: answer.type, // Required for Jackson @JsonTypeInfo
          id: answer.selectedOptionId,
        },
      };

    case 'FILL_IN_BLANK':
      return {
        id: answer.questionId,
        type: answer.type,
        answer: {
          type: answer.type, // Required for Jackson @JsonTypeInfo
          blankAnswers: answer.blanks.reduce(
            (acc, blank) => {
              acc[blank.segmentId] = blank.value;
              return acc;
            },
            {} as Record<string, string>
          ),
        },
      };

    case 'MATCHING':
      return {
        id: answer.questionId,
        type: answer.type,
        answer: {
          type: answer.type, // Required for Jackson @JsonTypeInfo
          matchedPairs: answer.matches.reduce(
            (acc, match) => {
              acc[match.leftId] = match.rightId;
              return acc;
            },
            {} as Record<string, string>
          ),
        },
      };

    case 'OPEN_ENDED':
      return {
        id: answer.questionId,
        type: answer.type,
        answer: {
          type: answer.type, // Required for Jackson @JsonTypeInfo
          response: answer.text,
          responseUrl: null,
        },
      };

    default:
      throw new Error(`Unknown answer type: ${(answer as any).type}`);
  }
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
        questions: request.answers.map(transformAnswerToDto), // Transform answers to backend format
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
