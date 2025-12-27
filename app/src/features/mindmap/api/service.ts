import { API_MODE, type ApiMode } from '@aiprimary/api';
import {
  type MindmapApiService,
  type Mindmap,
  type MindmapCollectionRequest,
  type AiGeneratedNode,
} from '../types';
import { api } from '@aiprimary/api';
import { mapPagination, type ApiResponse, type Pagination } from '@aiprimary/api';

export default class MindmapRealApiService implements MindmapApiService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getMindmaps(request: MindmapCollectionRequest): Promise<ApiResponse<Mindmap[]>> {
    const response = await api.get<ApiResponse<Mindmap[]>>(`${this.baseUrl}/api/mindmaps`, {
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

  async getMindmapById(id: string): Promise<Mindmap> {
    const response = await api.get<ApiResponse<Mindmap>>(`${this.baseUrl}/api/mindmaps/${id}`);
    return response.data.data;
  }

  async createMindmap(data: Mindmap): Promise<Mindmap> {
    const response = await api.post<ApiResponse<Mindmap>>(`${this.baseUrl}/api/mindmaps`, data);
    return response.data.data;
  }

  async updateMindmap(id: string, data: Partial<Mindmap> | FormData): Promise<Mindmap> {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

    const response = await api.put<ApiResponse<Mindmap>>(`${this.baseUrl}/api/mindmaps/${id}`, data, config);
    return response.data.data;
  }

  async deleteMindmap(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/mindmaps/${id}`);
  }

  async updateMindmapTitle(id: string, name: string): Promise<any | null> {
    await api.patch(`${this.baseUrl}/api/mindmaps/${id}/title`, {
      title: name,
    });
    // API returns 204 No Content
    return null;
  }

  async generateMindmap(
    request: import('../types/service').MindmapGenerateRequest
  ): Promise<AiGeneratedNode> {
    const response = await api.post<ApiResponse<AiGeneratedNode>>(
      `${this.baseUrl}/api/mindmaps/generate`,
      request
    );
    return response.data.data;
  }
}
