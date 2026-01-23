import type { NotificationApiService } from '../types';
import NotificationService from './service';
import { getBackendUrl } from '@/shared/utils/backend-url';
import { api, type ApiClient } from '@aiprimary/api';

export const useNotificationApiService = (): NotificationApiService => {
  return new NotificationService(api, getBackendUrl());
};

export const getNotificationApiService = (apiClient: ApiClient = api): NotificationApiService => {
  return new NotificationService(apiClient, getBackendUrl());
};

export type { NotificationApiService } from '../types';
