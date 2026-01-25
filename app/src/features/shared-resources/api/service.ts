import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { SharedResource } from '../types';

export interface SharedResourceApiService {
  getType(): 'real';
  getSharedWithMe(): Promise<SharedResource[]>;
}

export default class SharedResourceService implements SharedResourceApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'real' as const;
  }

  async getSharedWithMe(): Promise<SharedResource[]> {
    const response = await this.apiClient.get<ApiResponse<SharedResource[]>>(
      `${this.baseUrl}/api/resources/shared-with-me`
    );
    return response.data.data;
  }
}
