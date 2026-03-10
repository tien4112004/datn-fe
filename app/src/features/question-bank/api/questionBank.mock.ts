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

export default class QuestionBankMockService implements QuestionBankApiService {
  constructor(_apiClient: ApiClient, _baseUrl: string) {}

  async getQuestions(_filters?: QuestionBankFilters): Promise<QuestionBankApiResponse> {
    return Promise.resolve({ data: [], message: 'ok' } as unknown as QuestionBankApiResponse);
  }

  async getQuestionById(id: string): Promise<QuestionBankItem> {
    throw new Error(`Mock: getQuestionById(${id}) not implemented`);
  }

  async createQuestion(
    question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QuestionBankItem> {
    return Promise.resolve({ ...question, id: `mock-${Date.now()}` } as QuestionBankItem);
  }

  async createQuestions(
    questions: Array<Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<QuestionBankItem[]> {
    return Promise.resolve(
      questions.map((q, i) => ({ ...q, id: `mock-${Date.now()}-${i}` }) as QuestionBankItem)
    );
  }

  async updateQuestion(id: string, question: Partial<QuestionBankItem>): Promise<QuestionBankItem> {
    return Promise.resolve({ ...question, id } as QuestionBankItem);
  }

  async deleteQuestion(_id: string): Promise<void> {
    return Promise.resolve();
  }

  async bulkDeleteQuestions(_ids: string[]): Promise<void> {
    return Promise.resolve();
  }

  async duplicateQuestion(id: string): Promise<QuestionBankItem> {
    throw new Error(`Mock: duplicateQuestion(${id}) not implemented`);
  }

  async exportQuestions(_filters?: QuestionBankFilters): Promise<Blob> {
    return Promise.resolve(new Blob(['mock,csv'], { type: 'text/csv' }));
  }

  async importQuestions(
    _file: File
  ): Promise<{ success: number; failed: number; errors?: Array<{ row: number; error: string }> }> {
    return Promise.resolve({ success: 0, failed: 0 });
  }

  async getChapters(_subject: string, _grade: string): Promise<ChapterResponse[]> {
    return Promise.resolve([]);
  }

  async generateQuestions(_request: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
    throw new Error('Mock: generateQuestions not implemented');
  }
}
