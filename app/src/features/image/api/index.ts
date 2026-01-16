import type { ImageApiService } from '../types/service';
import ImageService from './service';
import { api, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useImageApiService = (): ImageApiService => {
  return new ImageService(api, getBackendUrl());
};

export const getImageApiService = (apiClient: ApiClient = api): ImageApiService => {
  return new ImageService(apiClient, getBackendUrl());
};
