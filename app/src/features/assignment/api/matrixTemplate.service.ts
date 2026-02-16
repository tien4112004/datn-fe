import type { ApiClient } from '@aiprimary/api';
import type {
  MatrixTemplate,
  MatrixTemplateFilters,
  MatrixTemplateApiResponse,
  MatrixTemplateCreateRequest,
  MatrixTemplateUpdateRequest,
} from '../types/matrixTemplate';

export interface MatrixTemplateApiService {
  getTemplates(filters?: MatrixTemplateFilters): Promise<MatrixTemplateApiResponse>;
  getTemplateById(id: string): Promise<MatrixTemplate>;
  createTemplate(request: MatrixTemplateCreateRequest): Promise<MatrixTemplate>;
  updateTemplate(id: string, request: MatrixTemplateUpdateRequest): Promise<MatrixTemplate>;
  deleteTemplate(id: string): Promise<void>;
}

export default class MatrixTemplateService implements MatrixTemplateApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async getTemplates(filters?: MatrixTemplateFilters): Promise<MatrixTemplateApiResponse> {
    const queryParams: Record<string, any> = {};

    if (filters?.search) {
      queryParams.search = filters.search;
    }
    if (filters?.subject) {
      queryParams.subject = filters.subject;
    }
    if (filters?.grade) {
      queryParams.grade = filters.grade;
    }
    if (filters?.page) {
      queryParams.page = filters.page;
    }
    if (filters?.pageSize) {
      queryParams.pageSize = filters.pageSize;
    }

    const response = await this.apiClient.get(`${this.baseUrl}/api/matrix-templates`, {
      params: queryParams,
    });
    return response.data;
  }

  async getTemplateById(id: string): Promise<MatrixTemplate> {
    const response = await this.apiClient.get(`${this.baseUrl}/api/matrix-templates/${id}`);
    return response.data.data;
  }

  async createTemplate(request: MatrixTemplateCreateRequest): Promise<MatrixTemplate> {
    const response = await this.apiClient.post(`${this.baseUrl}/api/matrix-templates`, request);
    return response.data.data;
  }

  async updateTemplate(id: string, request: MatrixTemplateUpdateRequest): Promise<MatrixTemplate> {
    const response = await this.apiClient.patch(`${this.baseUrl}/api/matrix-templates/${id}`, request);
    return response.data.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/matrix-templates/${id}`);
  }
}
