import type { ClassFeedApiService } from '../types';
import type {
  Post,
  Comment,
  PostCreateRequest,
  PostUpdateRequest,
  CommentCreateRequest,
  PostListResponse,
  FeedFilter,
} from '../types';
import { API_MODE, type ApiMode } from '@aiprimary/api';
import { api } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';

export default class ClassFeedRealApiService implements ClassFeedApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  private _mapPost(data: any): Post {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  private _mapComment(data: any): Comment {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
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

    return {
      ...response.data.data,
      data: response.data.data.data.map((post) => this._mapPost(post)),
    };
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

    return this._mapPost(response.data.data);
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

    return this._mapPost(response.data.data);
  }

  async deletePost(postId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/posts/${postId}`);
  }

  async pinPost(postId: string, _pinned: boolean): Promise<Post> {
    // Backend pin endpoint doesn't require body, just POST to pin/unpin
    const response = await api.post<ApiResponse<Post>>(`${this.baseUrl}/api/posts/${postId}/pin`);

    return this._mapPost(response.data.data);
  }

  async getComments(postId: string): Promise<Comment[]> {
    const response = await api.get<ApiResponse<Comment[]>>(`${this.baseUrl}/api/posts/${postId}/comments`);

    return response.data.data.map((comment) => this._mapComment(comment));
  }

  async createComment(request: CommentCreateRequest): Promise<Comment> {
    const response = await api.post<ApiResponse<Comment>>(
      `${this.baseUrl}/api/posts/${request.postId}/comments`,
      { content: request.content }
    );

    return this._mapComment(response.data.data);
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/comments/${commentId}`);
  }
}
