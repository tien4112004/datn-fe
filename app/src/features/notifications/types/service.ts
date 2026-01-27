export interface RegisterDeviceRequest {
  token: string;
}

export interface SendNotificationRequest {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export type NotificationType =
  | 'POST'
  | 'ASSIGNMENT'
  | 'COMMENT'
  | 'GRADE'
  | 'ANNOUNCEMENT'
  | 'REMINDER'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedNotificationsResponse {
  data: AppNotification[];
  pagination: PaginationInfo;
}

export interface NotificationApiService {
  registerDevice(request: RegisterDeviceRequest): Promise<void>;
  sendNotification(request: SendNotificationRequest): Promise<{ message: string }>;
  getNotifications(page: number, size: number): Promise<PaginatedNotificationsResponse>;
  getUnreadCount(): Promise<UnreadCountResponse>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}
