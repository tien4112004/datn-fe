import type { PresentationApiService } from '../types/service';
import PresentationMockService from './mock';
import PresentationRealApiService from './service';
import { createApiServiceFactory } from '@/shared/api';
import useBackendUrlStore from '@/features/settings/stores/useBackendUrlStore';

export const usePresentationApiService = (): PresentationApiService => {
  const backendUrl = useBackendUrlStore((state) => state.backendUrl);

  return createApiServiceFactory<PresentationApiService>(
    PresentationMockService,
    PresentationRealApiService,
    backendUrl
  );
};
