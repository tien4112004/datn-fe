import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type {
  CommentApiService,
  Comment,
  CommentBackendResponse,
  CreateCommentRequest,
  Mention,
  UpdateCommentRequest,
} from '../types';

/**
 * Rounds a date string to seconds (removes milliseconds)
 * Example: "2024-01-14T10:30:45.123Z" -> "2024-01-14T10:30:45Z"
 */
function roundToSeconds(dateString: string): string {
  try {
    const date = new Date(dateString);
    date.setMilliseconds(0);
    return date.toISOString();
  } catch {
    return dateString;
  }
}

function transformBackendComment(
  backendComment: CommentBackendResponse,
  documentType: 'presentation' | 'mindmap'
): Comment {
  const documentId =
    documentType === 'presentation' ? backendComment.presentationId : backendComment.mindmapId;

  // Ensure dates are valid, fallback to now if missing
  const createdAt = backendComment.createdAt || new Date().toISOString();
  const updatedAt = backendComment.updatedAt || createdAt;

  // Round to seconds for accurate comparison
  const createdAtRounded = roundToSeconds(createdAt);
  const updatedAtRounded = roundToSeconds(updatedAt);

  return {
    id: backendComment.id,
    documentId: documentId!,
    documentType,
    content: backendComment.content,

    // Transform flat user fields to author object
    author: {
      id: backendComment.userId,
      name: backendComment.userName,
      avatarUrl: backendComment.userAvatar,
    },

    // Permission flags from isOwner
    canEdit: backendComment.isOwner,
    canDelete: backendComment.isOwner,

    // Mentioned users
    mentionedUserIds: backendComment.mentionedUsers || [],

    // Timestamps
    createdAt: createdAtRounded,
    updatedAt: updatedAtRounded,

    // Computed - compare rounded timestamps to avoid millisecond differences
    isEdited: createdAtRounded !== updatedAtRounded,
  };
}

export default class CommentRealApiService implements CommentApiService {
  private apiClient: ApiClient;
  private baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async getComments(
    documentType: string,
    documentId: string,
    page?: number,
    pageSize?: number
  ): Promise<Comment[]> {
    const response = await this.apiClient.get<ApiResponse<CommentBackendResponse[]>>(
      `${this.baseUrl}/api/${documentType}s/${documentId}/comments`,
      { params: { page, pageSize } }
    );
    const backendComments = response.data.data;
    return backendComments.map((comment) =>
      transformBackendComment(comment, documentType as 'presentation' | 'mindmap')
    );
  }

  async getCommentCount(documentType: string, documentId: string): Promise<number> {
    const response = await this.apiClient.get<ApiResponse<number>>(
      `${this.baseUrl}/api/${documentType}s/${documentId}/comments/count`
    );
    return response.data.data;
  }

  async createComment(
    documentType: string,
    documentId: string,
    data: CreateCommentRequest
  ): Promise<Comment> {
    const response = await this.apiClient.post<ApiResponse<CommentBackendResponse>>(
      `${this.baseUrl}/api/${documentType}s/${documentId}/comments`,
      { content: data.content, mentionedUsers: data.mentionedUserIds }
    );
    return transformBackendComment(response.data.data, documentType as 'presentation' | 'mindmap');
  }

  async updateComment(
    documentType: string,
    documentId: string,
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<Comment> {
    const response = await this.apiClient.put<ApiResponse<CommentBackendResponse>>(
      `${this.baseUrl}/api/${documentType}s/${documentId}/comments/${commentId}`,
      { content: data.content, mentionedUsers: data.mentionedUserIds }
    );
    return transformBackendComment(response.data.data, documentType as 'presentation' | 'mindmap');
  }

  async deleteComment(documentType: string, documentId: string, commentId: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/${documentType}s/${documentId}/comments/${commentId}`);
  }

  async getMentions(unreadOnly: boolean = false): Promise<Mention[]> {
    const response = await this.apiClient.get<ApiResponse<Mention[]>>(
      `${this.baseUrl}/api/comments/mentions`,
      {
        params: { unreadOnly },
      }
    );
    return response.data.data;
  }

  async markMentionAsRead(mentionId: string): Promise<void> {
    await this.apiClient.patch(`${this.baseUrl}/api/comments/mentions/${mentionId}/read`);
  }
}
