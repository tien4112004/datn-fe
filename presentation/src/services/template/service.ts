import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { SlideTemplate } from '@aiprimary/core';
import type { ITemplateApi } from './types';

export class TemplateService implements ITemplateApi {
  baseUrl: string;
  private readonly apiClient: ApiClient;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'real' as const;
  }

  async getSlideTemplates(): Promise<SlideTemplate[]> {
    try {
      const res = await this.apiClient.get<ApiResponse<SlideTemplate[]>>(
        `${this.baseUrl}/api/slide-templates`,
        {
          params: { pageSize: 1000 },
        }
      );

      // Check if response has expected structure
      if (!res?.data?.data) {
        console.warn('API response missing data.data property:', res);
        return [];
      }

      return res.data.data;
    } catch (error) {
      console.warn('Failed to fetch slide templates from API, will use frontend-data fallback:', error);
      return [];
    }
  }

  async getSlideTemplatesByLayout(layoutType: string): Promise<SlideTemplate[]> {
    try {
      // API doesn't support layout filtering, so fetch all and filter client-side
      const allTemplates = await this.getSlideTemplates();
      return allTemplates.filter((template) => template.layout === layoutType);
    } catch (error) {
      console.warn(
        `Failed to fetch slide templates for layout "${layoutType}" from API, will use frontend-data fallback:`,
        error
      );
      return [];
    }
  }
}
