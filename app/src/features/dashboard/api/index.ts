import type { DashboardApiService } from './types';
import DashboardService from './service';
import { api, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useDashboardApiService = (): DashboardApiService => {
  return new DashboardService(api, getBackendUrl());
};

export const getDashboardApiService = (apiClient: ApiClient = api): DashboardApiService => {
  return new DashboardService(apiClient, getBackendUrl());
};

export type { DashboardApiService } from './types';
export type { DocumentItem, RecentDocumentsRequest } from './types';
export { default as DashboardService } from './service';
