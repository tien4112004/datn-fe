import type { ImageApiService } from '../types/service';
import ImageMockService from './mock';
import ImageRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useImageApiService = (): ImageApiService => {
  const backendUrl = getBackendUrl();

  return createApiServiceFactory<ImageApiService>(ImageMockService, ImageRealApiService, backendUrl);
};

export const getImageApiService = (): ImageApiService => {
  const backendUrl = getBackendUrl();

  return getApiServiceFactory<ImageApiService>(ImageMockService, ImageRealApiService, backendUrl);
};
