import type { AuthApiService } from '../types';
import AuthService from './service';
import { api, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useAuthApiService = (): AuthApiService => {
  return new AuthService(api, getBackendUrl());
};

export const getAuthApiService = (apiClient: ApiClient = api): AuthApiService => {
  return new AuthService(apiClient, getBackendUrl());
};

export const createAuthApiService = (apiClient: ApiClient, baseUrl?: string): AuthApiService => {
  return new AuthService(apiClient, baseUrl || getBackendUrl());
};
