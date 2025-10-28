import type { Service } from '@/shared/api';
import type { MindMapNode, MindMapEdge } from './mindmap';
import type { ApiResponse } from '@/shared/types/api';

export interface MindmapData {
  id: string;
  title: string;
  description?: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'draft';
}

export interface MindmapCollectionRequest {
  page?: number;
  pageSize?: number;
  sort?: 'asc' | 'desc';
  filter?: string;
}

export interface MindmapApiService extends Service {
  getMindmapById(id: string): Promise<MindmapData>;
  getMindmaps(request: MindmapCollectionRequest): Promise<ApiResponse<MindmapData[]>>;
  createMindmap(data: MindmapData): Promise<MindmapData>;
  updateMindmapTitle(id: string, name: string): Promise<any | null>;
}
