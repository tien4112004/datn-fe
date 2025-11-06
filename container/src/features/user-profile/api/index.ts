import { createApiServiceFactory } from '@/shared/api/base-service';
import UserProfileMockApiService from './mock';
import UserProfileRealApiService from './service';

const userProfileService = createApiServiceFactory(UserProfileMockApiService, UserProfileRealApiService, '');

export default userProfileService;
