import { api, API_MODE, type ApiMode } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';
import type {
  CommentApiService,
  Comment,
  CreateCommentRequest,
  Mention,
  UpdateCommentRequest,
} from '../types';

export default class CommentRealApiService implements CommentApiService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getComments(
    documentType: string,
    documentId: string,
    page?: number,
    pageSize?: number
  ): Promise<Comment[]> {
    const response = await api.get<ApiResponse<Comment[]>>(
      `${this.baseUrl}/api/comments/${documentType}/${documentId}`,
      { params: { page, pageSize } }
    );
    return response.data.data;
  }

  async getCommentCount(documentType: string, documentId: string): Promise<number> {
    const response = await api.get<ApiResponse<number>>(
      `${this.baseUrl}/api/comments/${documentType}/${documentId}/count`
    );
    return response.data.data;
  }

  async createComment(
    documentType: string,
    documentId: string,
    data: CreateCommentRequest
  ): Promise<Comment> {
    const response = await api.post<ApiResponse<Comment>>(
      `${this.baseUrl}/api/comments/${documentType}/${documentId}`,
      data
    );
    return response.data.data;
  }

  async replyToComment(
    documentType: string,
    documentId: string,
    parentCommentId: string,
    data: CreateCommentRequest
  ): Promise<Comment> {
    const response = await api.post<ApiResponse<Comment>>(
      `${this.baseUrl}/api/comments/${documentType}/${documentId}/reply/${parentCommentId}`,
      data
    );
    return response.data.data;
  }

  async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    const response = await api.put<ApiResponse<Comment>>(`${this.baseUrl}/api/comments/${commentId}`, data);
    return response.data.data;
  }

  async deleteComment(commentId: string, documentId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/comments/${commentId}`, {
      params: { documentId },
    });
  }

  async getMentions(unreadOnly: boolean = false): Promise<Mention[]> {
    const response = await api.get<ApiResponse<Mention[]>>(`${this.baseUrl}/api/comments/mentions`, {
      params: { unreadOnly },
    });
    return response.data.data;
  }

  async markMentionAsRead(mentionId: string): Promise<void> {
    await api.patch(`${this.baseUrl}/api/comments/mentions/${mentionId}/read`);
  }
}
