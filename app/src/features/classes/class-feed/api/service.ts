import { API_MODE, type ApiMode } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';
import { api } from '@aiprimary/api';
import type {
  ClassFeedApiService,
  Comment,
  CommentCreateRequest,
  FeedFilter,
  Post,
  PostCreateRequest,
  PostListResponse,
  PostUpdateRequest,
} from '../types';

export default class ClassFeedRealApiService implements ClassFeedApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getPosts(classId: string, filter?: FeedFilter, page = 1, pageSize = 20): Promise<PostListResponse> {
    const response = await api.get<ApiResponse<PostListResponse>>(
      `${this.baseUrl}/api/classes/${classId}/posts`,
      {
        params: {
          page: page.toString(),
          size: pageSize.toString(),
          type: filter?.type !== 'all' ? filter?.type : undefined,
          search: filter?.search || undefined,
        },
      }
    );

    return response.data.data;
  }

  async createPost(request: PostCreateRequest): Promise<Post> {
    // Backend expects JSON, not FormData
    // If files need to be uploaded, handle separately via media endpoint
    const payload = {
      content: request.content,
      type: request.type,
      attachments: request.attachments || [],
      linkedResourceIds: request.linkedResourceIds,
      linkedLessonId: request.linkedLessonId,
      allowComments: request.allowComments,
    };

    const response = await api.post<ApiResponse<Post>>(
      `${this.baseUrl}/api/classes/${request.classId}/posts`,
      payload
    );

    return response.data.data;
  }

  async updatePost(request: PostUpdateRequest): Promise<Post> {
    // Backend expects JSON, not FormData
    const payload = {
      content: request.content,
      type: request.type,
      attachments: request.attachments || [],
      linkedResourceIds: request.linkedResourceIds,
      linkedLessonId: request.linkedLessonId,
      isPinned: request.isPinned,
      allowComments: request.allowComments,
    };

    const response = await api.put<ApiResponse<Post>>(`${this.baseUrl}/api/posts/${request.id}`, payload);

    return response.data.data;
  }

  async deletePost(postId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/posts/${postId}`);
  }

  async pinPost(postId: string, pinned: boolean): Promise<Post> {
    // Backend pin endpoint doesn't require body, just POST to pin/unpin
    const response = await api.post<ApiResponse<Post>>(`${this.baseUrl}/api/posts/${postId}/pin`);

    return response.data.data;
  }

  async getComments(postId: string): Promise<Comment[]> {
    const response = await api.get<ApiResponse<Comment[]>>(`${this.baseUrl}/api/posts/${postId}/comments`);

    return response.data.data;
  }

  async createComment(request: CommentCreateRequest): Promise<Comment> {
    const response = await api.post<ApiResponse<Comment>>(
      `${this.baseUrl}/api/posts/${request.postId}/comments`,
      { content: request.content }
    );

    return response.data.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/comments/${commentId}`);
  }
}
