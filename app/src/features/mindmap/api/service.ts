import { API_MODE, type ApiMode, type ApiClient } from '@aiprimary/api';
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
import { mapPagination, type ApiResponse, type Pagination } from '@aiprimary/api';

export default class MindmapServiceImpl implements MindmapApiService {
  baseUrl: string;
  client: ApiClient;

  constructor(baseUrl: string, client: ApiClient) {
    this.baseUrl = baseUrl;
    this.client = client;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getMindmaps(request: MindmapCollectionRequest): Promise<ApiResponse<MindmapResponse[]>> {
    const response = await this.client.get<ApiResponse<MindmapResponse[]>>(`${this.baseUrl}/api/mindmaps`, {
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
    const response = await this.client.get<ApiResponse<MindmapResponse>>(
      `${this.baseUrl}/api/mindmaps/${id}`
    );
    return response.data.data;
  }

  async createMindmap(data: MindmapCreateInput): Promise<MindmapResponse> {
    const response = await this.client.post<ApiResponse<MindmapResponse>>(
      `${this.baseUrl}/api/mindmaps`,
      data
    );
    return response.data.data;
  }

  async updateMindmap(id: string, data: MindmapUpdateInput): Promise<MindmapResponse> {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

    const response = await this.client.put<ApiResponse<MindmapResponse>>(
      `${this.baseUrl}/api/mindmaps/${id}`,
      data,
      config
    );
    return response.data.data;
  }

  async deleteMindmap(id: string): Promise<void> {
    await this.client.delete(`${this.baseUrl}/api/mindmaps/${id}`);
  }

  async updateMindmapTitle(id: string, name: string): Promise<MindmapTitleUpdateResponse> {
    await this.client.patch(`${this.baseUrl}/api/mindmaps/${id}/title`, {
      title: name,
    });
    // API returns 204 No Content
    return null;
  }

  async generateMindmap(request: MindmapGenerateRequest): Promise<AiGeneratedNode> {
    const response = await this.client.post<ApiResponse<AiGeneratedNode>>(
      `${this.baseUrl}/api/mindmaps/generate`,
      request
    );
    return response.data.data;
  }
}
