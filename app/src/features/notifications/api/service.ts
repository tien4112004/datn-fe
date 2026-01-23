import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { NotificationApiService, RegisterDeviceRequest, SendNotificationRequest } from '../types';

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
}
