import { api, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';
import GenerationService from './generation.service';
import GenerationMockService from './generation.mock';

export const getGenerationService = (apiClient: ApiClient = api) => {
  return new GenerationMockService();
  return new GenerationService(apiClient, getBackendUrl());
};
