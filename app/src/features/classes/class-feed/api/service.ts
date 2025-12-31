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
import { API_MODE, type ApiMode } from '@/shared/constants';
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
    const formData = new FormData();
    formData.append('type', request.type);
    formData.append('content', request.content);

    if (request.attachments) {
      request.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const response = await api.post<ApiResponse<Post>>(
      `${this.baseUrl}/api/classes/${request.classId}/posts`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }

  async updatePost(request: PostUpdateRequest): Promise<Post> {
    const formData = new FormData();
    formData.append('content', request.content);

    if (request.attachments) {
      request.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const response = await api.put<ApiResponse<Post>>(`${this.baseUrl}/api/posts/${request.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  async deletePost(postId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/posts/${postId}`);
  }

  async pinPost(postId: string, pinned: boolean): Promise<Post> {
    const response = await api.post<ApiResponse<Post>>(`${this.baseUrl}/api/posts/${postId}/pin`, { pinned });

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

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const response = await api.put<ApiResponse<Comment>>(`${this.baseUrl}/api/comments/${commentId}`, {
      content,
    });

    return response.data.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/comments/${commentId}`);
  }
}
