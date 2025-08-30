import { API_MODE, type ApiMode } from '@/shared/constants';
import { type MindmapApiService, type MindmapData } from '../types';
// import api from '@/shared/api';

export default class MindmapRealApiService implements MindmapApiService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getMindmapById(id: string): Promise<MindmapData> {
    console.warn('getMindmapById is not implemented in MindmapRealApiService');
    // TODO: Implement real API call
    // const response = await api.get<MindmapData>(`/mindmaps/${id}`);
    // return response.data;
    throw new Error(`getMindmapById is not implemented in MindmapRealApiService for id: ${id}`);
  }
}
