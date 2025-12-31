import { API_MODE } from '@aiprimary/api';
import { api } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';
import type { SlideTemplate } from '@aiprimary/core';
import type { ITemplateApi } from './types';

export class TemplateApiService implements ITemplateApi {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType() {
    return API_MODE.real;
  }

  async getSlideTemplates(): Promise<SlideTemplate[]> {
    try {
      const res = await api.get<ApiResponse<SlideTemplate[]>>(`${this.baseUrl}/api/slide-templates`, {
        params: { pageSize: 1000 },
      });

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
