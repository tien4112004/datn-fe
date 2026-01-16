import type { ClassFeedApiService } from '../types';
import ClassFeedService from './service';
import { api, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useClassFeedApiService = (): ClassFeedApiService => {
  return new ClassFeedService(api, getBackendUrl());
};

export const getClassFeedApiService = (apiClient: ApiClient = api): ClassFeedApiService => {
  return new ClassFeedService(apiClient, getBackendUrl());
};

// Deprecated: Use useClassFeedApiService() hook instead
export const classFeedApi = getClassFeedApiService();

export type { ClassFeedApiService } from '../types';
export { default as ClassFeedService } from './service';
