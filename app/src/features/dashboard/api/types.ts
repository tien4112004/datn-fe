import type { ApiResponse } from '@aiprimary/api';

export interface DocumentItem {
  id: string;
  title: string;
  thumbnail?: string;
  updatedAt: string;
  type: 'presentation' | 'mindmap';
}

export interface RecentDocumentsRequest {
  limit?: number;
}

export interface DashboardApiService {
  getType(): 'real' | 'mock';
  getRecentDocuments(request?: RecentDocumentsRequest): Promise<ApiResponse<DocumentItem[]>>;
}
