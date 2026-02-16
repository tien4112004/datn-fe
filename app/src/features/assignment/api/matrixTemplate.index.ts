import { api, getBackendUrl, type ApiClient } from '@aiprimary/api';
import type { MatrixTemplateApiService } from './matrixTemplate.service';
import MatrixTemplateService from './matrixTemplate.service';

export const useMatrixTemplateApiService = (): MatrixTemplateApiService => {
  return new MatrixTemplateService(api, getBackendUrl());
};

export const getMatrixTemplateApiService = (apiClient: ApiClient = api): MatrixTemplateApiService => {
  return new MatrixTemplateService(apiClient, getBackendUrl());
};
