import type { Service } from '@/shared/api';
import type { MindMapNode, MindMapEdge } from './index';

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

export interface MindmapApiService extends Service {
  getMindmapById(id: string): Promise<MindmapData>;
}
