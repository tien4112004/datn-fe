import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type {
  DashboardApiService,
  DocumentItem,
  RecentDocumentsRequest,
  TeacherSummary,
  GradingQueueItem,
  ClassAtRiskStudents,
  CalendarEvent,
  ClassPerformance,
  RecentActivity,
} from './types';

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

  // Analytics API methods

  async getTeacherSummary(): Promise<ApiResponse<TeacherSummary>> {
    const response = await this.apiClient.get<ApiResponse<TeacherSummary>>(
      `${this.baseUrl}/api/analytics/teacher/summary`
    );
    return response.data;
  }

  async getGradingQueue(page: number = 0, size: number = 50): Promise<ApiResponse<GradingQueueItem[]>> {
    const response = await this.apiClient.get<ApiResponse<GradingQueueItem[]>>(
      `${this.baseUrl}/api/analytics/teacher/grading-queue`,
      {
        params: { page, size },
      }
    );
    return response.data;
  }

  async getAtRiskStudents(): Promise<ApiResponse<ClassAtRiskStudents[]>> {
    const response = await this.apiClient.get<ApiResponse<ClassAtRiskStudents[]>>(
      `${this.baseUrl}/api/analytics/teacher/students/at-risk`
    );
    return response.data;
  }

  async getTeacherCalendar(startDate?: string, endDate?: string): Promise<ApiResponse<CalendarEvent[]>> {
    const response = await this.apiClient.get<ApiResponse<CalendarEvent[]>>(
      `${this.baseUrl}/api/analytics/teacher/calendar`,
      {
        params: {
          startDate,
          endDate,
        },
      }
    );
    return response.data;
  }

  async getClassPerformance(classId: string): Promise<ApiResponse<ClassPerformance>> {
    const response = await this.apiClient.get<ApiResponse<ClassPerformance>>(
      `${this.baseUrl}/api/analytics/teacher/classes/${classId}/performance`
    );
    return response.data;
  }

  async getRecentActivity(limit: number = 20): Promise<ApiResponse<RecentActivity[]>> {
    const response = await this.apiClient.get<ApiResponse<RecentActivity[]>>(
      `${this.baseUrl}/api/analytics/teacher/recent-activity`,
      {
        params: { limit },
      }
    );
    return response.data;
  }
}
