import type { PresentationApiService } from '../types/service';
import PresentationService from './service';
import { api, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const usePresentationApiService = (): PresentationApiService => {
  return new PresentationService(api, getBackendUrl());
};

export const getPresentationApiService = (apiClient: ApiClient = api): PresentationApiService => {
  return new PresentationService(apiClient, getBackendUrl());
};
