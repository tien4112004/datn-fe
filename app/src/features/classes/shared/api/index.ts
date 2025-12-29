import type { ClassApiService } from '../types';
import ClassMockApiService from './mock';
import ClassRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useClassApiService = (): ClassApiService => {
  const backendUrl = getBackendUrl();

  // Force mock service for Classes module
  return new ClassMockApiService();
};

export const getClassApiService = (): ClassApiService => {
  const backendUrl = getBackendUrl();

  // Force mock service for Classes module
  return new ClassMockApiService();
};

// Deprecated: Use useClassApiService() hook instead
export const classApiService = getClassApiService();

export type { ClassApiService } from '../types';
export { ClassMockApiService, ClassRealApiService };
