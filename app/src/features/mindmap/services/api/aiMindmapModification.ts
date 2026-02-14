import type {
  RefineNodeContentRequest,
  ExpandNodeRequest,
  RefineBranchRequest,
  AIModificationResponse,
} from '../../types/aiModification';
import { api } from '@aiprimary/api';

const BASE_URL = '/api/ai/mindmap';

export const aiMindmapModificationApi = {
  /**
   * Refine a single mindmap node's content
   * (expand, shorten, fix grammar, formalize)
   */
  refineNode: async (request: RefineNodeContentRequest): Promise<AIModificationResponse> => {
    const response = await api.post<AIModificationResponse>(`${BASE_URL}/refine-node`, request);
    return response.data;
  },

  /**
   * Generate child nodes for a mindmap node
   */
  expandNode: async (request: ExpandNodeRequest): Promise<AIModificationResponse> => {
    const response = await api.post<AIModificationResponse>(`${BASE_URL}/expand-node`, request);
    return response.data;
  },

  /**
   * Refine multiple nodes in a mindmap branch together
   */
  refineBranch: async (request: RefineBranchRequest): Promise<AIModificationResponse> => {
    const response = await api.post<AIModificationResponse>(`${BASE_URL}/refine-branch`, request);
    return response.data;
  },
};
