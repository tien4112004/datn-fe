import type { ApiClient } from '@aiprimary/api';
import type {
  GenerateQuestionsFromContextRequest,
  GenerateQuestionsFromContextResponse,
  GenerateQuestionsByTopicRequest,
  GenerateQuestionsByTopicResponse,
} from '../types/generation';

export default class GenerationService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async generateQuestionsFromContext(
    request: GenerateQuestionsFromContextRequest
  ): Promise<GenerateQuestionsFromContextResponse> {
    const response = await this.apiClient.post(
      `${this.baseUrl}/api/question-bank/generate-from-context`,
      request
    );
    return response.data.data;
  }

  async generateQuestionsByTopic(
    request: GenerateQuestionsByTopicRequest
  ): Promise<GenerateQuestionsByTopicResponse> {
    const response = await this.apiClient.post(
      `${this.baseUrl}/api/question-bank/generate-by-topic`,
      request
    );
    return response.data.data;
  }
}
