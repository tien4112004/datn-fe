import { api } from '@aiprimary/api';
import type {
  QuestionBankApiService,
  QuestionBankItem,
  QuestionBankFilters,
  QuestionBankResponse,
} from '../types/questionBank';

export default class QuestionBankRealApiService implements QuestionBankApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async getQuestions(filters?: QuestionBankFilters): Promise<QuestionBankResponse> {
    const response = await api.get(`${this.baseUrl}/api/question-bank`, {
      params: filters,
    });
    return response.data.data;
  }

  async getQuestionById(id: string): Promise<QuestionBankItem> {
    const response = await api.get(`${this.baseUrl}/api/question-bank/${id}`);
    return response.data.data;
  }

  async createQuestion(
    question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QuestionBankItem> {
    const response = await api.post(`${this.baseUrl}/api/question-bank`, question);
    return response.data.data;
  }

  async updateQuestion(id: string, question: Partial<QuestionBankItem>): Promise<QuestionBankItem> {
    const response = await api.put(`${this.baseUrl}/api/question-bank/${id}`, question);
    return response.data.data;
  }

  async deleteQuestion(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/question-bank/${id}`);
  }

  async bulkDeleteQuestions(ids: string[]): Promise<void> {
    await api.post(`${this.baseUrl}/api/question-bank/bulk-delete`, { ids });
  }

  async duplicateQuestion(id: string): Promise<QuestionBankItem> {
    const response = await api.post(`${this.baseUrl}/api/question-bank/${id}/duplicate`);
    return response.data.data;
  }

  async copyToPersonal(id: string): Promise<QuestionBankItem> {
    const response = await api.post(`${this.baseUrl}/api/question-bank/${id}/copy-to-personal`);
    return response.data.data;
  }

  async exportQuestions(filters?: QuestionBankFilters): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/api/question-bank/export`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  async importQuestions(file: File): Promise<{ success: number; failed: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`${this.baseUrl}/api/question-bank/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }
}
