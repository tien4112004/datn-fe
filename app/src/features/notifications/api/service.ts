import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type {
  NotificationApiService,
  RegisterDeviceRequest,
  SendNotificationRequest,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
} from '../types';

export default class NotificationService implements NotificationApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async registerDevice(request: RegisterDeviceRequest): Promise<void> {
    await this.apiClient.post(`${this.baseUrl}/api/notifications/device`, request);
  }

  async sendNotification(request: SendNotificationRequest): Promise<{ message: string }> {
    const response = await this.apiClient.post<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/api/notifications/send`,
      request
    );
    return response.data.data;
  }

  async getNotifications(page: number, size: number): Promise<PaginatedNotificationsResponse> {
    const response = await this.apiClient.get<ApiResponse<PaginatedNotificationsResponse>>(
      `${this.baseUrl}/api/notifications`,
      { params: { page, size } }
    );
    return (
      response.data.data ?? {
        data: [],
        pagination: { currentPage: page, pageSize: size, totalItems: 0, totalPages: 0 },
      }
    );
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await this.apiClient.get<ApiResponse<UnreadCountResponse>>(
      `${this.baseUrl}/api/notifications/unread-count`
    );
    return response.data.data ?? { count: 0 };
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.apiClient.put(`${this.baseUrl}/api/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await this.apiClient.put(`${this.baseUrl}/api/notifications/read-all`);
  }
}
