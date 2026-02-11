import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { Submission } from '@aiprimary/core';
import { getAllDifficulties, getAllQuestionTypes, createTopicId } from '@aiprimary/core';
import type { AssignmentApiService, AssignmentCollectionRequest } from '../types/service';
import type {
  Assignment,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  AssignmentFormData,
  AssignmentTopic,
  GenerateMatrixRequest,
  GenerateMatrixResponse,
} from '../types';
import { createMatrixCellsForTopic } from '../utils/matrixHelpers';
import { mergeApiMatrixIntoCells } from '../utils/matrixConversion';

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
    return this.normalizeAssignment(response.data.data);
  }

  /**
   * Get assignment by ID using public endpoint (no document permission check)
   * This should be used by students accessing assignments through posts/submissions
   */
  async getAssignmentByIdPublic(id: string): Promise<Assignment> {
    const response = await this.apiClient.get(`${this.baseUrl}/api/assignments/${id}/public`);
    return this.normalizeAssignment(response.data.data);
  }

  /**
   * Get assignment by post ID using new post-based endpoint
   * This endpoint fetches assignment data through the post relationship
   * Should be used in feed contexts where post ID is available
   * @param postId - The post ID that links to the assignment
   */
  async getAssignmentByPostId(postId: string): Promise<Assignment> {
    const response = await this.apiClient.get(`${this.baseUrl}/api/posts/${postId}/assignment`);
    return this.normalizeAssignment(response.data.data);
  }

  /** Normalize questions from flat API format to nested { question, points } structure */
  private normalizeAssignment(assignment: any): Assignment {
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

  async generateMatrix(request: GenerateMatrixRequest): Promise<GenerateMatrixResponse> {
    const response = await this.apiClient.post(`${this.baseUrl}/api/exams/generate-matrix`, request);
    return response.data.data;
  }
}

// ============================================================================
// Frontend Data Transformation Functions
// ============================================================================

/**
 * Create a default topic for new assignments
 */
export function createDefaultTopic() {
  return {
    id: createTopicId(),
    name: 'General',
    description: '',
  };
}

/**
 * Transform an Assignment to AssignmentFormInitData for the form
 */
export function transformAssignmentToFormData(assignment: Assignment): AssignmentFormData {
  const difficulties = getAllDifficulties();
  const questionTypes = getAllQuestionTypes();

  // Flatten topic > subtopic hierarchy into a flat topics list
  let topics: AssignmentTopic[] = (assignment.matrix?.dimensions?.topics ?? []).flatMap((topic) =>
    (topic.subtopics ?? [])
      .filter((sub) => sub.name?.trim())
      .map((sub) => ({
        id: sub.id || createTopicId(),
        name: sub.name,
        parentTopic: topic.name,
      }))
  );

  // Fall back to a default topic if empty
  if (topics.length === 0) {
    topics = [createDefaultTopic()];
  }

  // Questions are already in nested { question, points } format from the service
  const questions = (assignment.questions || []) as any;

  // Create full matrix grid for all topics with all difficulty × questionType combinations
  const fullMatrixCells = topics.flatMap((topic) =>
    createMatrixCellsForTopic(topic.id, topic.name, difficulties, questionTypes)
  );

  // Merge required counts from API matrix if available
  const matrixCells = assignment.matrix?.dimensions
    ? mergeApiMatrixIntoCells(assignment.matrix, fullMatrixCells)
    : fullMatrixCells;

  // Filter out cells with requiredCount = 0 to avoid clutter
  const nonZeroCells = matrixCells.filter((cell) => cell.requiredCount > 0);

  return {
    title: assignment.title || 'Untitled Assignment',
    description: assignment.description || '',
    subject: assignment.subject || '',
    grade: assignment.grade || '',
    shuffleQuestions: assignment.shuffleQuestions || false,
    topics,
    contexts: assignment.contexts || [],
    questions,
    matrix: nonZeroCells,
  };
}

/**
 * Create empty form data for a new assignment
 */
export function createEmptyFormData(): AssignmentFormData {
  const topic = createDefaultTopic();

  return {
    title: 'Untitled Assignment',
    description: '',
    subject: '',
    grade: '',
    shuffleQuestions: false,
    topics: [topic],
    contexts: [],
    questions: [],
    matrix: [], // Start with empty matrix, cells will be added on demand
  };
}
