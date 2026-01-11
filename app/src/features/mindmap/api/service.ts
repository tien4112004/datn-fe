import { API_MODE, type ApiMode } from '@aiprimary/api';
import {
  type MindmapApiService,
  type MindmapResponse,
  type MindmapCreateInput,
  type MindmapUpdateInput,
  type MindmapCollectionRequest,
  type MindmapTitleUpdateResponse,
  type AiGeneratedNode,
  type MindmapGenerateRequest,
} from '../types';
import { api } from '@aiprimary/api';
import { mapPagination, type ApiResponse, type Pagination } from '@aiprimary/api';
import type { AxiosInstance } from 'axios';

export default class MindmapRealApiService implements MindmapApiService {
  baseUrl: string;
  private apiClient: AxiosInstance;

  constructor(baseUrl: string, apiClient: AxiosInstance = api) {
    this.baseUrl = baseUrl;
    this.apiClient = apiClient;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getMindmaps(request: MindmapCollectionRequest): Promise<ApiResponse<MindmapResponse[]>> {
    const response = await api.get<ApiResponse<MindmapResponse[]>>(`${this.baseUrl}/api/mindmaps`, {
      params: {
        page: (request.page || 0) + 1,
        pageSize: request.pageSize,
        sort: request.sort,
      },
    });

    return {
      ...response.data,
      data: response.data.data,
      pagination: mapPagination(response.data.pagination as Pagination),
    };
  }

  async getMindmapById(id: string): Promise<MindmapResponse> {
    const response = await api.get<ApiResponse<MindmapResponse>>(`${this.baseUrl}/api/mindmaps/${id}`);
    return response.data.data;
  }

  async createMindmap(data: MindmapCreateInput): Promise<MindmapResponse> {
    const response = await api.post<ApiResponse<MindmapResponse>>(`${this.baseUrl}/api/mindmaps`, data);
    return response.data.data;
  }

  async updateMindmap(id: string, data: MindmapUpdateInput): Promise<MindmapResponse> {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

    const response = await api.put<ApiResponse<MindmapResponse>>(
      `${this.baseUrl}/api/mindmaps/${id}`,
      data,
      config
    );
    return response.data.data;
  }

  async deleteMindmap(id: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/mindmaps/${id}`);
  }

  async updateMindmapTitle(id: string, name: string): Promise<MindmapTitleUpdateResponse> {
    await api.patch(`${this.baseUrl}/api/mindmaps/${id}/title`, {
      title: name,
    });
    // API returns 204 No Content
    return null;
  }

  async generateMindmap(request: MindmapGenerateRequest): Promise<AiGeneratedNode> {
    const response = await api.post<ApiResponse<AiGeneratedNode>>(
      `${this.baseUrl}/api/mindmaps/generate`,
      request
    );
    return response.data.data;
  }
}
