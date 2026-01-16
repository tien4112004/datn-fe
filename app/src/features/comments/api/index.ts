import { api, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';
import type { CommentApiService } from '../types/service';
import CommentRealApiService from './service';

export const useCommentApiService = (): CommentApiService => {
  return new CommentRealApiService(api, getBackendUrl());
};

export const getCommentApiService = (apiClient: ApiClient = api): CommentApiService => {
  return new CommentRealApiService(apiClient, getBackendUrl());
};

export const createCommentApiService = (apiClient: ApiClient, baseUrl?: string): CommentApiService => {
  return new CommentRealApiService(apiClient, baseUrl || getBackendUrl());
};
