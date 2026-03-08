import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { ExamplePromptType, ExamplePromptContent } from '../types/examplePrompt';

export interface UpdateChapterPayload {
  grade?: string;
  subject?: string;
  chapter?: string;
}

export interface ExamplePromptsApiService {
  getExamplePrompts(type: ExamplePromptType, language?: string): Promise<ExamplePromptContent[]>;
  updateDocumentChapter(documentType: string, id: string, payload: UpdateChapterPayload): Promise<void>;
}

export default class ExamplePromptsService implements ExamplePromptsApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'real' as const;
  }

  async getExamplePrompts(type: ExamplePromptType, language?: string): Promise<ExamplePromptContent[]> {
    const response = await this.apiClient.get<ApiResponse<ExamplePromptContent[]>>(
      `${this.baseUrl}/api/example-prompts`,
      {
        params: { type, language, count: 6 },
      }
    );
    return response.data.data;
  }

  async updateDocumentChapter(
    documentType: string,
    id: string,
    payload: UpdateChapterPayload
  ): Promise<void> {
    await this.apiClient.patch(`${this.baseUrl}/api/documents/${documentType}/${id}/update-chapter`, payload);
  }
}
