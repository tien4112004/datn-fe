import type { PresentationApiService } from '../types/service';
import PresentationMockService from './mock';
import PresentationRealApiService from './service';
import { createApiServiceFactory } from '@/shared/api';

export const usePresentationApiService = (): PresentationApiService => {
  return createApiServiceFactory<PresentationApiService>(PresentationMockService, PresentationRealApiService);
};
