import { api } from '@aiprimary/api';
import type {
  QuestionBankApiService,
  QuestionBankItem,
  QuestionBankFilters,
  QuestionBankResponse,
} from '../types/questionBank';
import { toBackendQuestion, toFrontendQuestion } from '../utils/questionMapper';
import { toBackendDifficulty } from '../utils/difficultyMapper';
import { toBackendQuestionType } from '../utils/questionTypeMapper';

export default class QuestionBankRealApiService implements QuestionBankApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async getQuestions(filters?: QuestionBankFilters): Promise<QuestionBankResponse> {
    // Convert arrays to comma-separated strings for API and map frontend values to backend
    const queryParams: any = { ...filters };

    // Map difficulty values (frontend Vietnamese -> backend English)
    if (filters?.difficulty) {
      if (Array.isArray(filters.difficulty)) {
        queryParams.difficulty = filters.difficulty.map(toBackendDifficulty).join(',');
      } else {
        queryParams.difficulty = toBackendDifficulty(filters.difficulty);
      }
    }

    // Map subject code (frontend uses subjectCode, backend uses subject)
    if (filters?.subjectCode) {
      if (Array.isArray(filters.subjectCode)) {
        queryParams.subject = filters.subjectCode.join(',');
      } else {
        queryParams.subject = filters.subjectCode;
      }
      delete queryParams.subjectCode;
    }

    // Map question type (frontend lowercase -> backend uppercase)
    if (filters?.questionType) {
      if (Array.isArray(filters.questionType)) {
        queryParams.type = filters.questionType.map(toBackendQuestionType).join(',');
      } else {
        queryParams.type = toBackendQuestionType(filters.questionType);
      }
      delete queryParams.questionType;
    }

    // Join grade and chapter arrays
    if (Array.isArray(filters?.grade)) {
      queryParams.grade = filters.grade.join(',');
    }
    if (Array.isArray(filters?.chapter)) {
      queryParams.chapter = filters.chapter.join(',');
    }

    // Ensure bankType is set (personal or public)
    queryParams.bankType = filters?.bankType || 'personal';

    const response = await api.get(`${this.baseUrl}/api/question-bank`, {
      params: queryParams,
    });

    // Unwrap AppResponseDto and transform each question
    const backendData = response.data.data || [];
    const pagination = response.data.pagination || {};

    return {
      questions: backendData.map(toFrontendQuestion),
      total: pagination.totalItems || 0,
      page: pagination.currentPage || 1,
      limit: pagination.pageSize || 10,
    };
  }

  async getQuestionById(id: string): Promise<QuestionBankItem> {
    const response = await api.get(`${this.baseUrl}/api/question-bank/${id}`);
    return toFrontendQuestion(response.data.data);
  }

  async createQuestion(
    question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QuestionBankItem> {
    const backendQuestion = toBackendQuestion(question);

    // Backend expects array for batch create
    const response = await api.post(`${this.baseUrl}/api/question-bank`, [backendQuestion]);

    // Extract first successful result from BatchCreateQuestionResponseDto
    const result = response.data.data.successful[0];
    return toFrontendQuestion(result);
  }

  async updateQuestion(id: string, question: Partial<QuestionBankItem>): Promise<QuestionBankItem> {
    const backendQuestion = toBackendQuestion(question);
    const response = await api.put(`${this.baseUrl}/api/question-bank/${id}`, backendQuestion);
    return toFrontendQuestion(response.data.data);
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

  async getChapters(subject: string, grade: string): Promise<string[]> {
    const response = await api.get(`${this.baseUrl}/api/question-bank/metadata/chapters`, {
      params: { subject, grade },
    });
    return response.data.data;
  }
}
