export interface RegisterDeviceRequest {
  token: string;
}

export interface SendNotificationRequest {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface NotificationApiService {
  registerDevice(request: RegisterDeviceRequest): Promise<void>;
  sendNotification(request: SendNotificationRequest): Promise<{ message: string }>;
}
