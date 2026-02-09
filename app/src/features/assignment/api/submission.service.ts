import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { Submission, Answer, Grade } from '@aiprimary/core';

export interface SubmissionCreateRequest {
  postId: string;
  answers: Answer[];
}

export interface SubmissionGradeRequest {
  questionScores: Record<string, number>; // questionId -> score mapping
  questionFeedback?: Record<string, string>; // questionId -> feedback mapping
  overallFeedback?: string;
}

export interface SubmissionApiService {
  createSubmission(request: SubmissionCreateRequest): Promise<Submission>;
  getSubmissionsByPost(postId: string): Promise<Submission[]>;
  getSubmissionById(submissionId: string): Promise<Submission>;
  gradeSubmission(submissionId: string, request: SubmissionGradeRequest): Promise<Submission>;
  deleteSubmission(submissionId: string): Promise<void>;
}

/** Backend AnswerData DTO shape (each question entry in submission.questions) */
interface AnswerDataDto {
  id: string;
  answer?: {
    type?: string;
    id?: string;
    blankAnswers?: Record<string, string>;
    matchedPairs?: Record<string, string>;
    response?: string;
    responseUrl?: string | null;
  };
  point?: number;
  feedback?: string;
  isAutoGraded?: boolean;
}

/** Backend AnswerData DTO for outgoing requests */
interface AnswerDataRequestDto {
  id: string;
  answer: {
    type: string;
    id?: string;
    blankAnswers?: Record<string, string>;
    matchedPairs?: Record<string, string>;
    response?: string;
    responseUrl?: string | null;
  };
}

/** Backend submission response shape */
interface SubmissionDto {
  id: string;
  assignmentId: string;
  studentId: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  postId: string;
  questions?: AnswerDataDto[];
  submittedAt: string;
  score?: number;
  maxScore?: number;
  status: 'in_progress' | 'submitted' | 'graded';
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

/**
 * Transform backend AnswerDataDto format to frontend Answer format
 * Backend: { id, answer: { type, id/blankAnswers/matchedPairs/response }, point, feedback }
 * Frontend: { questionId, type, selectedOptionId/blanks/matches/text }
 */
function transformDtoToAnswer(dto: AnswerDataDto): Answer {
  const questionId = dto.id;
  const type = dto.answer?.type;
  const answerData = dto.answer;

  if (!answerData) {
    throw new Error(`Missing answer data for question ${questionId}`);
  }

  switch (type) {
    case 'MULTIPLE_CHOICE':
      return {
        questionId,
        type: 'MULTIPLE_CHOICE',
        selectedOptionId: answerData.id || '',
      };

    case 'FILL_IN_BLANK':
      return {
        questionId,
        type: 'FILL_IN_BLANK',
        blanks: Object.entries(answerData.blankAnswers || {}).map(([segmentId, value]) => ({
          segmentId,
          value,
        })),
      };

    case 'MATCHING':
      return {
        questionId,
        type: 'MATCHING',
        matches: Object.entries(answerData.matchedPairs || {}).map(([leftId, rightId]) => ({
          leftId,
          rightId,
        })),
      };

    case 'OPEN_ENDED':
      return {
        questionId,
        type: 'OPEN_ENDED',
        text: answerData.response || '',
      };

    default:
      throw new Error(`Unknown answer type: ${type}`);
  }
}

/**
 * Transform frontend Answer format to backend AnswerDataDto format
 * Frontend: { questionId, type, selectedOptionId/blanks/matches/text }
 * Backend: { id, answer: { type, id/blankAnswers/matchedPairs/response } }
 * Note: The type field is included in the nested answer for Jackson polymorphic deserialization
 */
function transformAnswerToDto(answer: Answer): AnswerDataRequestDto {
  switch (answer.type) {
    case 'MULTIPLE_CHOICE':
      return {
        id: answer.questionId,
        answer: {
          type: answer.type,
          id: answer.selectedOptionId,
        },
      };

    case 'FILL_IN_BLANK':
      return {
        id: answer.questionId,
        answer: {
          type: answer.type,
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
        answer: {
          type: answer.type,
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
        answer: {
          type: answer.type,
          response: answer.text,
          responseUrl: null,
        },
      };

    default: {
      const _exhaustive: never = answer;
      throw new Error(`Unknown answer type: ${(_exhaustive as Answer).type}`);
    }
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
    const response = await this.apiClient.post<ApiResponse<SubmissionDto>>(
      `${this.baseUrl}/api/posts/${request.postId}/submissions`,
      {
        questions: request.answers.map(transformAnswerToDto),
      }
    );

    const data = response.data.data;
    return this.transformSubmission(data);
  }

  async getSubmissionsByPost(postId: string): Promise<Submission[]> {
    const response = await this.apiClient.get<ApiResponse<SubmissionDto[]>>(
      `${this.baseUrl}/api/posts/${postId}/submissions`
    );

    return response.data.data.map((s) => this.transformSubmission(s));
  }

  async getSubmissionById(submissionId: string): Promise<Submission> {
    const response = await this.apiClient.get<ApiResponse<SubmissionDto>>(
      `${this.baseUrl}/api/submissions/${submissionId}`
    );

    return this.transformSubmission(response.data.data);
  }

  async gradeSubmission(submissionId: string, request: SubmissionGradeRequest): Promise<Submission> {
    const response = await this.apiClient.put<ApiResponse<SubmissionDto>>(
      `${this.baseUrl}/api/submissions/${submissionId}/grade`,
      request
    );

    return this.transformSubmission(response.data.data);
  }

  private transformSubmission(data: SubmissionDto): Submission {
    // Derive grades from per-answer point/feedback fields (backend stores grades at answer level)
    const questions = data.questions || [];
    const grades: Grade[] = questions
      .filter((q) => q.point !== undefined && q.point !== null)
      .map((q) => ({
        questionId: q.id,
        points: q.point!,
        feedback: q.feedback,
      }));

    return {
      id: data.id,
      assignmentId: data.assignmentId,
      studentId: data.studentId,
      student: data.student,
      answers: questions.map(transformDtoToAnswer),
      submittedAt: data.submittedAt,
      score: data.score,
      maxScore: data.maxScore,
      status: data.status,
      grades: grades.length > 0 ? grades : undefined,
      feedback: data.feedback,
      gradedAt: data.gradedAt,
      gradedBy: data.gradedBy,
    };
  }

  async deleteSubmission(submissionId: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/submissions/${submissionId}`);
  }
}
