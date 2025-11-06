import type { UserProfileApiService } from './service';
import UserProfileMockApiService from './mock';
import UserProfileRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useUserProfileApiService = (): UserProfileApiService => {
  const backendUrl = getBackendUrl();

  return createApiServiceFactory<UserProfileApiService>(
    UserProfileMockApiService,
    UserProfileRealApiService,
    backendUrl
  );
};

export const getUserProfileApiService = (): UserProfileApiService => {
  const backendUrl = getBackendUrl();

  return getApiServiceFactory<UserProfileApiService>(
    UserProfileMockApiService,
    UserProfileRealApiService,
    backendUrl
  );
};
