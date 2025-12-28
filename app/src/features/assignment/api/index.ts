import { getBackendUrl } from '@/shared/utils/backend-url';
import type { AssignmentApiService } from '../types/service';
import AssignmentMockService from './mock';
import AssignmentRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';

export const useAssignmentApiService = (): AssignmentApiService => {
  const baseUrl = getBackendUrl();
  return createApiServiceFactory<AssignmentApiService>(
    AssignmentMockService,
    AssignmentRealApiService,
    baseUrl
  );
};

export const getAssignmentApiService = (): AssignmentApiService => {
  const baseUrl = getBackendUrl();
  return getApiServiceFactory<AssignmentApiService>(AssignmentMockService, AssignmentRealApiService, baseUrl);
};
