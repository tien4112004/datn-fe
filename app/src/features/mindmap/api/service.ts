import type { User } from '@/features/user/types';
import type { ApiClient, ApiResponse } from '@aiprimary/api';
import { mapPagination, type Pagination } from '@aiprimary/api';
import { parsePermissionHeader } from '../../../shared/utils/permission';
import {
  type AiGeneratedNode,
  type MindmapApiService,
  type MindmapCollectionRequest,
  type MindmapCreateInput,
  type MindmapGenerateRequest,
  type MindmapMetadataResponse,
  type MindmapResponse,
  type MindmapTitleUpdateResponse,
  type MindmapUpdateInput,
} from '../types';
import type {
  AIModificationResponse,
  ExpandNodeRequest,
  RefineBranchRequest,
  RefineNodeContentRequest,
} from '../types/aiModification';
import type {
  PublicAccessRequest,
  PublicAccessResponse,
  SharedUserApiResponse,
  ShareRequest,
  ShareResponse,
  ShareStateResponse,
} from '../types/share';

export default class MindmapService implements MindmapApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'real' as const;
  }

  async getMindmaps(request: MindmapCollectionRequest): Promise<ApiResponse<MindmapResponse[]>> {
    const response = await this.apiClient.get<ApiResponse<MindmapResponse[]>>(
      `${this.baseUrl}/api/mindmaps`,
      {
        params: {
          page: (request.page || 0) + 1,
          pageSize: request.pageSize,
          sort: request.sort,
        },
      }
    );

    return {
      ...response.data,
      data: response.data.data,
      pagination: mapPagination(response.data.pagination as Pagination),
    };
  }

  async getMindmapById(id: string): Promise<MindmapResponse> {
    const response = await this.apiClient.get<ApiResponse<MindmapResponse>>(
      `${this.baseUrl}/api/mindmaps/${id}`
    );
    const mindmap = response.data.data;

    // Extract permission from response header (added by backend PermissionHeaderResponseWrapper)
    const permissionHeader = response.headers['permission']; // axios lowercases headers
    if (permissionHeader) {
      mindmap.permission = parsePermissionHeader(permissionHeader);
    }

    return mindmap;
  }

  async getMindmapMetadata(id: string): Promise<MindmapMetadataResponse> {
    const response = await this.apiClient.get<ApiResponse<MindmapMetadataResponse>>(
      `${this.baseUrl}/api/mindmaps/${id}/metadata`
    );
    return response.data.data;
  }

  async createMindmap(data: MindmapCreateInput): Promise<MindmapResponse> {
    const response = await this.apiClient.post<ApiResponse<MindmapResponse>>(
      `${this.baseUrl}/api/mindmaps`,
      data
    );
    return response.data.data;
  }

  async updateMindmap(id: string, data: MindmapUpdateInput): Promise<MindmapResponse> {
    const response = await this.apiClient.put<ApiResponse<MindmapResponse>>(
      `${this.baseUrl}/api/mindmaps/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteMindmap(id: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/mindmaps/${id}`);
  }

  async updateMindmapTitle(id: string, name: string): Promise<MindmapTitleUpdateResponse> {
    await this.apiClient.patch(`${this.baseUrl}/api/mindmaps/${id}/title`, {
      title: name,
    });
    // API returns 204 No Content
    return null;
  }

  async generateMindmap(request: MindmapGenerateRequest): Promise<AiGeneratedNode> {
    const response = await this.apiClient.post<ApiResponse<AiGeneratedNode>>(
      `${this.baseUrl}/api/mindmaps/generate`,
      request
    );
    return response.data.data;
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await this.apiClient.get<ApiResponse<User[]>>(`${this.baseUrl}/api/users`, {
      params: { search: query, pageSize: 20 },
    });
    return response.data.data;
  }

  async shareMindmap(id: string, shareData: ShareRequest): Promise<ShareResponse> {
    const response = await this.apiClient.post<ApiResponse<ShareResponse>>(
      `${this.baseUrl}/api/resources/${id}/share`,
      shareData
    );
    return response.data.data;
  }

  async getSharedUsers(id: string): Promise<SharedUserApiResponse[]> {
    const response = await this.apiClient.get<ApiResponse<SharedUserApiResponse[]>>(
      `${this.baseUrl}/api/resources/${id}/shared-users`
    );
    return response.data.data;
  }

  async revokeAccess(mindmapId: string, userId: string): Promise<void> {
    await this.apiClient.post(`${this.baseUrl}/api/resources/${mindmapId}/revoke`, {
      targetUserId: userId,
    });
  }

  async setPublicAccess(mindmapId: string, request: PublicAccessRequest): Promise<PublicAccessResponse> {
    const response = await this.apiClient.put<ApiResponse<PublicAccessResponse>>(
      `${this.baseUrl}/api/resources/${mindmapId}/public-access`,
      request
    );
    return response.data.data;
  }

  async getPublicAccessStatus(mindmapId: string): Promise<PublicAccessResponse> {
    const response = await this.apiClient.get<ApiResponse<PublicAccessResponse>>(
      `${this.baseUrl}/api/resources/${mindmapId}/public-access`
    );
    return response.data.data;
  }

  async getShareState(mindmapId: string): Promise<ShareStateResponse> {
    const response = await this.apiClient.get<ApiResponse<ShareStateResponse>>(
      `${this.baseUrl}/api/resources/${mindmapId}/share-state`
    );
    return response.data.data;
  }

  async refineNode(request: RefineNodeContentRequest): Promise<AIModificationResponse> {
    const response = await this.apiClient.post<AIModificationResponse>(
      `${this.baseUrl}/api/ai/mindmap/refine-node`,
      {
        ...request,
        provider: request.provider?.toLowerCase(),
      }
    );
    return response.data;
  }

  async expandNode(request: ExpandNodeRequest): Promise<AIModificationResponse> {
    const response = await this.apiClient.post<AIModificationResponse>(
      `${this.baseUrl}/api/ai/mindmap/expand-node`,
      {
        ...request,
        provider: request.provider?.toLowerCase(),
      }
    );
    return response.data;
  }

  async refineBranch(request: RefineBranchRequest): Promise<AIModificationResponse> {
    const response = await this.apiClient.post<AIModificationResponse>(
      `${this.baseUrl}/api/ai/mindmap/refine-branch`,
      {
        ...request,
        provider: request.provider?.toLowerCase(),
      }
    );
    return response.data;
  }
}
