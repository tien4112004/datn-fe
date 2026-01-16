import { api, type ApiClient, getBackendUrl } from '@aiprimary/api';
import { TemplateService } from './service';
import type { ITemplateApi } from './types';

/**
 * Get a template API service instance
 */
export const getTemplateApi = (apiClient: ApiClient = api): ITemplateApi => {
  return new TemplateService(apiClient, getBackendUrl());
};
