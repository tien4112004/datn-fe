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
    const res = await api.get<ApiResponse<SlideTemplate[]>>(`${this.baseUrl}/api/slide-templates`, {
      params: { pageSize: 1000 },
    });
    return res.data.data;
  }

  async getSlideTemplatesByLayout(layoutType: string): Promise<SlideTemplate[]> {
    const res = await api.get<ApiResponse<SlideTemplate[]>>(`${this.baseUrl}/api/slide-templates`, {
      params: { layout: layoutType, pageSize: 1000 },
    });
    return res.data.data;
  }
}
