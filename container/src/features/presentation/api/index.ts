import type { PresentationApiService } from '../types/service';
import PresentationMockService from './mock';
import PresentationRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';

export const usePresentationApiService = (isLoader?: boolean): PresentationApiService => {
  if (isLoader) {
    return getApiServiceFactory<PresentationApiService>(PresentationMockService, PresentationRealApiService);
  }
  return createApiServiceFactory<PresentationApiService>(PresentationMockService, PresentationRealApiService);
};
