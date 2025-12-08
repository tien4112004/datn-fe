import type { ClassFeedApiService } from '../types';
import ClassFeedMockApiService from './mock';
import ClassFeedRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useClassFeedApiService = (): ClassFeedApiService => {
  const backendUrl = getBackendUrl();

  return createApiServiceFactory<ClassFeedApiService>(
    ClassFeedMockApiService,
    ClassFeedRealApiService,
    backendUrl
  );
};

export const getClassFeedApiService = (): ClassFeedApiService => {
  const backendUrl = getBackendUrl();

  return getApiServiceFactory<ClassFeedApiService>(
    ClassFeedMockApiService,
    ClassFeedRealApiService,
    backendUrl
  );
};

// Deprecated: Use useClassFeedApiService() hook instead
export const classFeedApi = getClassFeedApiService();

export type { ClassFeedApiService } from '../types';
export { default as ClassFeedMockApiService } from './mock';
export { default as ClassFeedRealApiService } from './service';
