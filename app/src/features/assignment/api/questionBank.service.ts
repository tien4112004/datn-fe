import type { ApiClient } from '@aiprimary/api';
import type {
  QuestionBankApiService,
  QuestionBankItem,
  QuestionBankFilters,
  QuestionBankApiResponse,
} from '../types/questionBank';
import { getAllSubjects, getElementaryGrades } from '@aiprimary/core';

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
    return response.data.data.created?.[0] || response.data.data;
  }

  async updateQuestion(id: string, question: Partial<QuestionBankItem>): Promise<QuestionBankItem> {
    const response = await this.apiClient.put(`${this.baseUrl}/api/question-bank/${id}`, question);
    return response.data.data;
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/question-bank/${id}`);
  }

  async bulkDeleteQuestions(ids: string[]): Promise<void> {
    await this.apiClient.post(`${this.baseUrl}/api/question-bank/bulk-delete`, { ids });
  }

  async duplicateQuestion(id: string): Promise<QuestionBankItem> {
    const response = await this.apiClient.post(`${this.baseUrl}/api/question-bank/${id}/duplicate`);
    return response.data.data;
  }

  async copyToPersonal(id: string): Promise<QuestionBankItem> {
    const response = await this.apiClient.post(`${this.baseUrl}/api/question-bank/${id}/copy-to-personal`);
    return response.data.data;
  }

  async exportQuestions(filters?: QuestionBankFilters): Promise<Blob> {
    const response = await this.apiClient.get(`${this.baseUrl}/api/question-bank/export`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  async importQuestions(file: File): Promise<{ success: number; failed: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.apiClient.post(`${this.baseUrl}/api/question-bank/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }

  async getSubjects(): Promise<string[]> {
    // Return static subject codes from frontend
    return getAllSubjects().map((s) => s.code);
  }

  async getGrades(): Promise<string[]> {
    // Return static elementary grade codes (1-5) from frontend
    return getElementaryGrades().map((g) => g.code);
  }

  async getChapters(_subject: string, _grade: string): Promise<string[]> {
    // Chapters are dynamic and curriculum-specific, return empty array
    // In the future, this could be populated from a static curriculum definition
    return [];
  }
}
