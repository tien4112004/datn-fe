import type { ClassApiService } from '../types';
import ClassMockApiService from './mock';
import ClassRealApiService from './service';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useClassApiService = (): ClassApiService => {
  const backendUrl = getBackendUrl();

  // Force mock service for Classes module
  return new ClassMockApiService(backendUrl);
};

export const getClassApiService = (): ClassApiService => {
  const backendUrl = getBackendUrl();

  // Force mock service for Classes module
  return new ClassMockApiService(backendUrl);
};

// Deprecated: Use useClassApiService() hook instead
export const classApiService = getClassApiService();

export type { ClassApiService } from '../types';
export { ClassMockApiService, ClassRealApiService };
