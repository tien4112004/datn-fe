import type { PresentationApiService } from '../types/service';
import PresentationMockService from './mock';
import PresentationRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const usePresentationApiService = (): PresentationApiService => {
  const backendUrl = getBackendUrl();

  return createApiServiceFactory<PresentationApiService>(
    PresentationMockService,
    PresentationRealApiService,
    backendUrl
  );
};

export const getPresentationApiService = (): PresentationApiService => {
  const backendUrl = getBackendUrl();

  return getApiServiceFactory<PresentationApiService>(
    PresentationMockService,
    PresentationRealApiService,
    backendUrl
  );
};
