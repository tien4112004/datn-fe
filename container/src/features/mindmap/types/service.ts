import type { Service } from '@/shared/api';
import type { ApiResponse } from '@/shared/types/api';
import type { Mindmap } from './mindmap';

export interface MindmapCollectionRequest {
  page?: number;
  pageSize?: number;
  sort?: 'asc' | 'desc';
  filter?: string;
}

export interface MindmapApiService extends Service {
  getMindmapById(id: string): Promise<Mindmap>;
  getMindmaps(request: MindmapCollectionRequest): Promise<ApiResponse<Mindmap[]>>;
  createMindmap(data: Mindmap): Promise<Mindmap>;
  updateMindmap(id: string, data: Partial<Mindmap>): Promise<Mindmap>;
  deleteMindmap(id: string): Promise<void>;
  updateMindmapTitle(id: string, name: string): Promise<any | null>;
}
