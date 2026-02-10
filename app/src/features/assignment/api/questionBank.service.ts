import type { ApiClient } from '@aiprimary/api';
import type {
  QuestionBankApiService,
  QuestionBankItem,
  QuestionBankFilters,
  QuestionBankApiResponse,
  ChapterResponse,
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
} from '../types/questionBank';
import { parseQuestionBankCSV, exportQuestionsToCSV } from '../utils/csvParser';
import { validateQuestionBankCSV } from '../utils/csvValidation';

export default class QuestionBankService implements QuestionBankApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async getQuestions(filters?: QuestionBankFilters): Promise<QuestionBankApiResponse> {
    // Build query params matching backend API expectations
    // Field names must match Spring Boot controller parameters exactly
    const queryParams: Record<string, any> = {};

    // Required field
    queryParams.bankType = filters?.bankType || 'personal';

    // Search (maps to 'search' param, searches in title field)
    if (filters?.search) {
      queryParams.search = filters.search;
    }

    // Filter fields (arrays for multi-select)
    // Arrays will be sent as repeated query params: ?type=A&type=B
    if (filters?.type && filters.type.length > 0) {
      queryParams.type = filters.type;
    }
    if (filters?.difficulty && filters.difficulty.length > 0) {
      queryParams.difficulty = filters.difficulty;
    }
    if (filters?.subject && filters.subject.length > 0) {
      queryParams.subject = filters.subject;
    }
    if (filters?.grade && filters.grade.length > 0) {
      queryParams.grade = filters.grade;
    }
    if (filters?.chapter && filters.chapter.length > 0) {
      queryParams.chapter = filters.chapter;
    }

    // Pagination
    if (filters?.page) {
      queryParams.page = filters.page;
    }
    if (filters?.pageSize) {
      queryParams.pageSize = filters.pageSize;
    }

    // Sorting
    if (filters?.sortBy) {
      queryParams.sortBy = filters.sortBy;
    }
    if (filters?.sortDirection) {
      queryParams.sortDirection = filters.sortDirection;
    }

    const response = await this.apiClient.get(`${this.baseUrl}/api/question-bank`, {
      params: queryParams,
    });
    return response.data;
  }

  async getQuestionById(id: string): Promise<QuestionBankItem> {
    const response = await this.apiClient.get(`${this.baseUrl}/api/question-bank/${id}`);
    return response.data.data;
  }

  async createQuestion(
    question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QuestionBankItem> {
    const response = await this.apiClient.post(`${this.baseUrl}/api/question-bank`, [question]);
    return response.data.data.successful?.[0] || response.data.data;
  }

  async createQuestions(
    questions: Array<Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<QuestionBankItem[]> {
    const response = await this.apiClient.post(`${this.baseUrl}/api/question-bank`, questions);
    return response.data.data.successful || response.data.data;
  }

  async updateQuestion(id: string, question: Partial<QuestionBankItem>): Promise<QuestionBankItem> {
    const response = await this.apiClient.put(`${this.baseUrl}/api/question-bank/${id}`, question);
    return response.data.data;
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/question-bank/${id}`);
  }

  async bulkDeleteQuestions(ids: string[]): Promise<void> {
    // Client-side implementation: delete one by one using existing endpoint
    for (const id of ids) {
      await this.deleteQuestion(id);
    }
  }

  async duplicateQuestion(id: string): Promise<QuestionBankItem> {
    // Client-side implementation: fetch question then create a copy
    const original = await this.getQuestionById(id);

    // Strip fields that backend generates
    const { id: _id, createdAt, updatedAt, ...questionData } = original;

    // Create new question with same data
    return this.createQuestion(questionData);
  }

  async exportQuestions(filters?: QuestionBankFilters): Promise<Blob> {
    // Client-side implementation: fetch all questions and generate CSV
    const allQuestions: QuestionBankItem[] = [];
    let page = 1;
    const pageSize = 100;

    // Fetch all pages
    while (true) {
      const response = await this.getQuestions({
        ...filters,
        bankType: filters?.bankType || 'personal',
        page,
        pageSize,
      });
      const questions = response.data || [];
      allQuestions.push(...questions);
      if (questions.length < pageSize) break;
      page++;
    }

    // Convert to CSV using existing utility
    const csvContent = exportQuestionsToCSV(allQuestions);

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  async importQuestions(
    file: File
  ): Promise<{ success: number; failed: number; errors?: Array<{ row: number; error: string }> }> {
    // Client-side implementation: parse CSV and create questions
    const content = await file.text();

    // Parse CSV to questions
    let questions: QuestionBankItem[];
    try {
      questions = parseQuestionBankCSV(content);
    } catch (error) {
      return {
        success: 0,
        failed: 0,
        errors: [{ row: 0, error: error instanceof Error ? error.message : 'Failed to parse CSV' }],
      };
    }

    // Validate questions
    const validation = validateQuestionBankCSV(questions);
    if (!validation.isValid) {
      return {
        success: 0,
        failed: questions.length,
        errors: validation.errors.map((e) => ({ row: e.row, error: e.message })),
      };
    }

    // Create questions using batch method
    try {
      const toCreate = questions.map(({ id: _id, createdAt, updatedAt, ...data }) => data);
      await this.createQuestions(toCreate as any);
      return { success: questions.length, failed: 0 };
    } catch (error) {
      return {
        success: 0,
        failed: questions.length,
        errors: [{ row: 0, error: error instanceof Error ? error.message : 'Batch create failed' }],
      };
    }
  }

  async getChapters(subject: string, grade: string): Promise<ChapterResponse[]> {
    const response = await this.apiClient.get(`${this.baseUrl}/api/chapters`, {
      params: { subject, grade },
    });
    return response.data.data || [];
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
    const response = await this.apiClient.post(`${this.baseUrl}/api/question-bank/generate`, request);
    return response.data.data;
  }
}
