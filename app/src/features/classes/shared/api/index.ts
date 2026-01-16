import type { ClassApiService } from '../types';
import ClassService from './service';
import { getBackendUrl } from '@/shared/utils/backend-url';
import { api, type ApiClient } from '@aiprimary/api';

export const useClassApiService = (): ClassApiService => {
  return new ClassService(api, getBackendUrl());
};

export const getClassApiService = (apiClient: ApiClient = api): ClassApiService => {
  return new ClassService(apiClient, getBackendUrl());
};

// Deprecated: Use useClassApiService() hook instead
export const classApiService = getClassApiService();

export type { ClassApiService } from '../types';
