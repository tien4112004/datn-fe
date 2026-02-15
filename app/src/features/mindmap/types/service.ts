import type { ApiResponse } from '@aiprimary/api';
import type {
  AIModificationResponse,
  ExpandNodeRequest,
  RefineBranchRequest,
  RefineNodeContentRequest,
} from './aiModification';
import type { AiGeneratedNode, Mindmap, MindMapEdge, MindmapMetadata, MindMapNode } from './mindmap';
import type {
  PublicAccessRequest,
  PublicAccessResponse,
  SharedUserApiResponse,
  ShareRequest,
  ShareResponse,
  ShareStateResponse,
  User,
} from './share';

export interface MindmapCollectionRequest {
  page?: number;
  pageSize?: number;
  sort?: 'asc' | 'desc';
  filter?: string;
}

export interface MindmapApiService {
  getType(): 'real' | 'mock';
  getMindmapById(id: string): Promise<MindmapResponse>;
  getMindmaps(request: MindmapCollectionRequest): Promise<ApiResponse<MindmapResponse[]>>;
  createMindmap(data: MindmapCreateInput): Promise<MindmapResponse>;
  updateMindmap(id: string, data: MindmapUpdateInput): Promise<MindmapResponse>;
  deleteMindmap(id: string): Promise<void>;
  updateMindmapTitle(id: string, name: string): Promise<MindmapTitleUpdateResponse>;
  generateMindmap(request: MindmapGenerateRequest): Promise<AiGeneratedNode>;

  // Metadata for AI context enrichment
  getMindmapMetadata(id: string): Promise<MindmapMetadataResponse>;

  // Share functionality
  searchUsers(query: string): Promise<User[]>;
  shareMindmap(id: string, shareData: ShareRequest): Promise<ShareResponse>;
  getSharedUsers(id: string): Promise<SharedUserApiResponse[]>;
  revokeAccess(mindmapId: string, userId: string): Promise<void>;

  // Public access methods
  setPublicAccess(mindmapId: string, request: PublicAccessRequest): Promise<PublicAccessResponse>;
  getPublicAccessStatus(mindmapId: string): Promise<PublicAccessResponse>;

  // Optimized single-call initialization
  getShareState(mindmapId: string): Promise<ShareStateResponse>;

  // AI modification methods
  refineNode(request: RefineNodeContentRequest): Promise<AIModificationResponse>;
  expandNode(request: ExpandNodeRequest): Promise<AIModificationResponse>;
  refineBranch(request: RefineBranchRequest): Promise<AIModificationResponse>;
}

/**
 * Lightweight metadata for AI context enrichment
 * Returned from /api/mindmaps/{id}/metadata
 */
export interface MindmapMetadataResponse {
  mindmapId: string;
  title: string;
  description?: string;
  rootNodeId?: string;
  grade?: string;
  subject?: string;
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
  /** The grade level for the content (max 50 chars) */
  grade?: string;
  /** The subject area for the content (max 100 chars) */
  subject?: string;
};
