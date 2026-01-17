import type { ApiClient } from '@aiprimary/api';
import type {
  QuestionBankApiService,
  QuestionBankItem,
  QuestionBankFilters,
  QuestionBankResponse,
} from '../types/questionBank';
import { getAllSubjects, getElementaryGrades } from '@aiprimary/core';

export default class QuestionBankService implements QuestionBankApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async getQuestions(filters?: QuestionBankFilters): Promise<QuestionBankResponse> {
    // Convert arrays to comma-separated strings for API
    const queryParams: any = { ...filters };

    if (Array.isArray(filters?.difficulty)) {
      queryParams.difficulty = filters.difficulty.join(',');
    }
    if (Array.isArray(filters?.subject)) {
      queryParams.subjectCode = filters.subject.join(',');
    }
    if (Array.isArray(filters?.questionType)) {
      queryParams.questionType = filters.questionType.join(',');
    }
    if (Array.isArray(filters?.grade)) {
      queryParams.grade = filters.grade.join(',');
    }
    if (Array.isArray(filters?.chapter)) {
      queryParams.chapter = filters.chapter.join(',');
    }

    // Ensure bankType is set (personal or public)
    queryParams.bankType = filters?.bankType || 'personal';

    const response = await this.apiClient.get(`${this.baseUrl}/api/question-bank`, {
      params: queryParams,
    });
    return response.data.data;
  }

  async getQuestionById(id: string): Promise<QuestionBankItem> {
    const response = await this.apiClient.get(`${this.baseUrl}/api/question-bank/${id}`);
    return response.data.data;
  }

  async createQuestion(
    question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QuestionBankItem> {
    const response = await this.apiClient.post(`${this.baseUrl}/api/question-bank`, question);
    return response.data.data;
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
