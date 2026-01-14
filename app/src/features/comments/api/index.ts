import { getBackendUrl } from '@/shared/utils/backend-url';
import type { CommentApiService } from '../types/service';
import CommentMockService from './mock';
import CommentRealApiService from './service';
import { createApiServiceFactory } from '@/shared/api';

export const useCommentApiService = (): CommentApiService => {
  const baseUrl = getBackendUrl();
  return createApiServiceFactory<CommentApiService>(CommentMockService, CommentRealApiService, baseUrl);
};
