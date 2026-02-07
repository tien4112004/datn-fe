import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { ExamplePromptType, ExamplePromptContent } from '../types/examplePrompt';

export interface ExamplePromptsApiService {
  getExamplePrompts(type: ExamplePromptType): Promise<ExamplePromptContent[]>;
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

  async getExamplePrompts(type: ExamplePromptType): Promise<ExamplePromptContent[]> {
    const response = await this.apiClient.get<ApiResponse<ExamplePromptContent[]>>(
      `${this.baseUrl}/api/example-prompts`,
      {
        params: { type },
      }
    );
    return response.data.data;
  }
}
