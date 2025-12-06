import type { Service } from '@/shared/api';
import type { ApiResponse } from '@aiprimary/api';
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
  generateMindmap(request: MindmapGenerateRequest): Promise<Mindmap>;
}

/**
 * Request body for generating a mindmap using AI.
 * Model and provider values come from the /features/model API.
 */
export type MindmapGenerateRequest = {
  /** The main topic or subject for the mindmap generation (1-500 chars) */
  topic: string;
  /** The AI model id to use for generation (from Model.id in /features/model) */
  model: string;
  /** The AI service provider (from Model.provider in /features/model) */
  provider: string;
  /** The language for the mindmap content (ISO 639-1 code) */
  language: 'en' | 'vi';
  /** Maximum depth of the mindmap branches (1-5, default 3) */
  maxDepth?: number;
  /** Maximum number of branches per node (1-10, default 5) */
  maxBranchesPerNode?: number;
};
