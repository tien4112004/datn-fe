import { api, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';
import GenerationService from './generation.service';

export const getGenerationService = (apiClient: ApiClient = api) => {
  return new GenerationService(apiClient, getBackendUrl());
};
