import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { DashboardApiService, DocumentItem, RecentDocumentsRequest } from './types';

export default class DashboardService implements DashboardApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'real' as const;
  }

  async getRecentDocuments(request?: RecentDocumentsRequest): Promise<ApiResponse<DocumentItem[]>> {
    const response = await this.apiClient.get<ApiResponse<any[]>>(`${this.baseUrl}/api/recent-documents`, {
      params: {
        pageSize: request?.limit,
      },
    });

    return {
      ...response.data,
      data: response.data.data.map((item) => ({
        ...item,
        id: item.documentId,
        updatedAt: item.lastVisited,
        type: item.documentType,
      })),
      pagination: response.data.pagination,
    };
  }
}
