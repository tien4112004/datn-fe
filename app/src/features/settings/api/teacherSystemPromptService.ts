import type { ApiClient, ApiResponse } from '@aiprimary/api';

export interface TeacherSystemPromptResponse {
  id: string;
  prompt: string;
  isActive: boolean;
  updatedAt: string;
}

export interface TeacherSystemPromptRequest {
  prompt: string;
}

export class TeacherSystemPromptService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async getMyPrompt(): Promise<TeacherSystemPromptResponse> {
    const response = await this.apiClient.get<ApiResponse<TeacherSystemPromptResponse>>(
      `${this.baseUrl}/api/teacher/system-prompt`
    );
    return response.data.data;
  }

  async upsertMyPrompt(data: TeacherSystemPromptRequest): Promise<TeacherSystemPromptResponse> {
    const response = await this.apiClient.put<ApiResponse<TeacherSystemPromptResponse>>(
      `${this.baseUrl}/api/teacher/system-prompt`,
      data
    );
    return response.data.data;
  }

  async deleteMyPrompt(): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/teacher/system-prompt`);
  }
}

import { api } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useTeacherSystemPromptService = () => {
  return new TeacherSystemPromptService(api, getBackendUrl());
};
