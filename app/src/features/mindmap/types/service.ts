import type { Service } from '@/shared/api';
import type { ApiResponse } from '@aiprimary/api';
import type { Mindmap, AiGeneratedNode, MindMapNode, MindMapEdge, MindmapMetadata } from './mindmap';
import type { User, SharedUserApiResponse, ShareRequest, ShareResponse } from './share';

export interface MindmapCollectionRequest {
  page?: number;
  pageSize?: number;
  sort?: 'asc' | 'desc';
  filter?: string;
}

export interface MindmapApiService extends Service {
  getMindmapById(id: string): Promise<MindmapResponse>;
  getMindmaps(request: MindmapCollectionRequest): Promise<ApiResponse<MindmapResponse[]>>;
  createMindmap(data: MindmapCreateInput): Promise<MindmapResponse>;
  updateMindmap(id: string, data: MindmapUpdateInput): Promise<MindmapResponse>;
  deleteMindmap(id: string): Promise<void>;
  updateMindmapTitle(id: string, name: string): Promise<MindmapTitleUpdateResponse>;
  generateMindmap(request: MindmapGenerateRequest): Promise<AiGeneratedNode>;

  // Share functionality
  searchUsers(query: string): Promise<User[]>;
  shareMindmap(id: string, shareData: ShareRequest): Promise<ShareResponse>;
  getSharedUsers(id: string): Promise<SharedUserApiResponse[]>;
  revokeAccess(mindmapId: string, userId: string): Promise<void>;
}

/**
 * Full mindmap object returned from the server (GET operations)
 */
export type MindmapResponse = Mindmap;

/**
 * Input data for creating a new mindmap
 * Omits server-generated fields (id, createdAt, updatedAt)
 */
export interface MindmapCreateInput {
  title: string;
  description?: string;
  thumbnail?: string;
  metadata?: MindmapMetadata;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

/**
 * Input data for updating an existing mindmap
 * Can be a partial Mindmap object or FormData (for file uploads like thumbnails)
 */
export type MindmapUpdateInput =
  | Partial<{
      title: string;
      description: string;
      thumbnail: string;
      metadata: MindmapMetadata;
      nodes: MindMapNode[];
      edges: MindMapEdge[];
    }>
  | FormData;

/**
 * Response from updateMindmapTitle - API returns 204 No Content
 */
export type MindmapTitleUpdateResponse = null;

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
