import type { AuthApiService } from '../types';
import AuthMockService from './mock';
import AuthRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useAuthApiService = (): AuthApiService => {
  const backendUrl = getBackendUrl();

  return createApiServiceFactory<AuthApiService>(AuthMockService, AuthRealApiService, backendUrl);
};

export const getAuthApiService = (): AuthApiService => {
  const backendUrl = getBackendUrl();

  return getApiServiceFactory<AuthApiService>(AuthMockService, AuthRealApiService, backendUrl);
};
