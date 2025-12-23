import { getApiServiceFactory } from '@aiprimary/api';
import { TemplateApiService } from './service';
import { MockTemplateApiService } from './mock';
import type { ITemplateApi } from './types';
import { getBackendUrl } from '@aiprimary/api';

const BASE_URL = getBackendUrl();

/**
 * Get a template API service instance based on current API mode
 */
export const getTemplateApi = (): ITemplateApi => {
  return getApiServiceFactory<ITemplateApi>(MockTemplateApiService, TemplateApiService, BASE_URL);
};
