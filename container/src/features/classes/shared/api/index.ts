import type { ClassApiService } from '../types';
import ClassMockApiService from './mock';
import ClassRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useClassApiService = (): ClassApiService => {
  const backendUrl = getBackendUrl();

  return createApiServiceFactory<ClassApiService>(ClassMockApiService, ClassRealApiService, backendUrl);
};

export const getClassApiService = (): ClassApiService => {
  const backendUrl = getBackendUrl();

  return getApiServiceFactory<ClassApiService>(ClassMockApiService, ClassRealApiService, backendUrl);
};

// Deprecated: Use useClassApiService() hook instead
export const classApiService = getClassApiService();

export type { ClassApiService } from '../types';
export { ClassMockApiService, ClassRealApiService };
