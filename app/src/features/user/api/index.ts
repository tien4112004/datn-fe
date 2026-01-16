import type { UserProfileApiService } from './service';
import UserProfileService from './service';
import { api, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useUserProfileApiService = (): UserProfileApiService => {
  return new UserProfileService(api, getBackendUrl());
};

export const getUserProfileApiService = (apiClient: ApiClient = api): UserProfileApiService => {
  return new UserProfileService(apiClient, getBackendUrl());
};

/**
 * Factory for creating UserProfile service with custom API client (useful for testing)
 */
export const createUserProfileApiService = (
  apiClient: ApiClient,
  baseUrl?: string
): UserProfileApiService => {
  return new UserProfileService(apiClient, baseUrl || getBackendUrl());
};
