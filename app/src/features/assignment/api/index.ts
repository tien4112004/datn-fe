import { getBackendUrl } from '@/shared/utils/backend-url';
import type { AssignmentApiService } from '../types/service';
import AssignmentService from './service';
import { api, type ApiClient } from '@aiprimary/api';

export const useAssignmentApiService = (): AssignmentApiService => {
  return new AssignmentService(api, getBackendUrl());
};

export const getAssignmentApiService = (apiClient: ApiClient = api): AssignmentApiService => {
  return new AssignmentService(apiClient, getBackendUrl());
};
