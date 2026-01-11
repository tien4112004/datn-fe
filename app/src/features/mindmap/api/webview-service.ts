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
import { webviewApi } from '@aiprimary/api';
import { mapPagination, type ApiResponse, type Pagination } from '@aiprimary/api';

/**
 * Webview-specific Mindmap API Service
 *
 * This service uses the webviewApi client which:
 * - Reads access token from localStorage (injected by mobile app)
 * - Sends token via Authorization header (not cookies)
 * - Used exclusively in mobile webview contexts
 */
export default class MindmapWebviewApiService implements MindmapApiService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getMindmaps(request: MindmapCollectionRequest): Promise<ApiResponse<MindmapResponse[]>> {
    const response = await webviewApi.get<ApiResponse<MindmapResponse[]>>(`${this.baseUrl}/api/mindmaps`, {
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
    const response = await webviewApi.get<ApiResponse<MindmapResponse>>(`${this.baseUrl}/api/mindmaps/${id}`);
    return response.data.data;
  }

  async createMindmap(data: MindmapCreateInput): Promise<MindmapResponse> {
    const response = await webviewApi.post<ApiResponse<MindmapResponse>>(
      `${this.baseUrl}/api/mindmaps`,
      data
    );
    return response.data.data;
  }

  async updateMindmap(id: string, data: MindmapUpdateInput): Promise<MindmapResponse> {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

    const response = await webviewApi.put<ApiResponse<MindmapResponse>>(
      `${this.baseUrl}/api/mindmaps/${id}`,
      data,
      config
    );
    return response.data.data;
  }

  async deleteMindmap(id: string): Promise<void> {
    await webviewApi.delete(`${this.baseUrl}/api/mindmaps/${id}`);
  }

  async updateMindmapTitle(id: string, name: string): Promise<MindmapTitleUpdateResponse> {
    await webviewApi.patch(`${this.baseUrl}/api/mindmaps/${id}/title`, {
      title: name,
    });
    // API returns 204 No Content
    return null;
  }

  async generateMindmap(request: MindmapGenerateRequest): Promise<AiGeneratedNode> {
    const response = await webviewApi.post<ApiResponse<AiGeneratedNode>>(
      `${this.baseUrl}/api/mindmaps/generate`,
      request
    );
    return response.data.data;
  }
}
