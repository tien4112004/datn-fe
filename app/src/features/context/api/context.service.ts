import type { ApiClient } from '@aiprimary/api';
import type { Context, ContextFilters, ContextApiResponse } from '../types';

export interface ContextApiService {
  getContexts(filters?: ContextFilters): Promise<ContextApiResponse>;
  getContextById(id: string): Promise<Context>;
  getContextsByIds(ids: string[]): Promise<Context[]>;
}

export default class ContextService implements ContextApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async getContexts(filters?: ContextFilters): Promise<ContextApiResponse> {
    const queryParams: Record<string, any> = {};

    if (filters?.search) {
      queryParams.search = filters.search;
    }
    if (filters?.subject && filters.subject.length > 0) {
      queryParams.subject = filters.subject;
    }
    if (filters?.grade && filters.grade.length > 0) {
      queryParams.grade = filters.grade;
    }
    if (filters?.page) {
      queryParams.page = filters.page;
    }
    if (filters?.pageSize) {
      queryParams.pageSize = filters.pageSize;
    }
    if (filters?.sortBy) {
      queryParams.sortBy = filters.sortBy;
    }
    if (filters?.sortDirection) {
      queryParams.sortDirection = filters.sortDirection;
    }

    const response = await this.apiClient.get(`${this.baseUrl}/api/contexts`, {
      params: queryParams,
    });
    return response.data;
  }

  async getContextById(id: string): Promise<Context> {
    const response = await this.apiClient.get(`${this.baseUrl}/api/contexts/${id}`);
    return response.data.data;
  }

  async getContextsByIds(ids: string[]): Promise<Context[]> {
    if (ids.length === 0) {
      return [];
    }
    const response = await this.apiClient.get(`${this.baseUrl}/api/contexts/batch`, {
      params: { ids: ids.join(',') },
    });
    return response.data.data;
  }
}
