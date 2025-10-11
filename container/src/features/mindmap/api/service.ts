import { API_MODE, type ApiMode } from '@/shared/constants';
import { type MindmapApiService, type MindmapData, type MindmapCollectionRequest } from '../types';
import { api } from '@/shared/api';
import { mapPagination, type ApiResponse, type Pagination } from '@/types/api';

export default class MindmapRealApiService implements MindmapApiService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getMindmaps(request: MindmapCollectionRequest): Promise<ApiResponse<MindmapData[]>> {
    const response = await api.get<ApiResponse<MindmapData[]>>(`${this.baseUrl}/api/mindmaps`, {
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

  async getMindmapById(id: string): Promise<MindmapData> {
    const response = await api.get<ApiResponse<MindmapData>>(`${this.baseUrl}/api/mindmaps/${id}`);
    return response.data.data;
  }

  async createMindmap(data: MindmapData): Promise<MindmapData> {
    const response = await api.post<ApiResponse<MindmapData>>(`${this.baseUrl}/api/mindmaps`, data);
    return response.data.data;
  }

  async updateMindmapTitle(id: string, name: string): Promise<any | null> {
    await api.patch(`${this.baseUrl}/api/mindmaps/${id}/title`, {
      title: name,
    });
    // API returns 204 No Content
    return null;
  }
}
