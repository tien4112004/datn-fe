import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type {
  ClassFeedApiService,
  Comment,
  CommentCreateRequest,
  FeedFilter,
  Post,
  PostCreateRequest,
  PostUpdateRequest,
} from '../types';

export default class ClassFeedService implements ClassFeedApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async getPosts(
    classId: string,
    filter?: FeedFilter,
    page = 1,
    pageSize = 20
  ): Promise<ApiResponse<Post[]>> {
    const response = await this.apiClient.get<ApiResponse<Post[]>>(
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

    return response.data;
  }

  async createPost(request: PostCreateRequest): Promise<Post> {
    // Backend expects JSON, not FormData
    // If files need to be uploaded, handle separately via media endpoint
    const payload = {
      content: request.content,
      type: request.type,
      attachments: request.attachments || [],
      linkedResources: request.linkedResources,
      linkedLessonId: request.linkedLessonId,
      allowComments: request.allowComments,
    };

    const response = await this.apiClient.post<ApiResponse<Post>>(
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
      linkedResources: request.linkedResources,
      linkedLessonId: request.linkedLessonId,
      isPinned: request.isPinned,
      allowComments: request.allowComments,
    };

    const response = await this.apiClient.put<ApiResponse<Post>>(
      `${this.baseUrl}/api/posts/${request.id}`,
      payload
    );

    return response.data.data;
  }

  async deletePost(postId: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/posts/${postId}`);
  }

  async pinPost(postId: string, pinned: boolean): Promise<Post> {
    const response = await this.apiClient.post<ApiResponse<Post>>(`${this.baseUrl}/api/posts/${postId}/pin`, {
      pinned,
    });

    return response.data.data;
  }

  async getComments(postId: string): Promise<Comment[]> {
    const response = await this.apiClient.get<ApiResponse<Comment[]>>(
      `${this.baseUrl}/api/posts/${postId}/comments`
    );

    return response.data.data;
  }

  async createComment(request: CommentCreateRequest): Promise<Comment> {
    const response = await this.apiClient.post<ApiResponse<Comment>>(
      `${this.baseUrl}/api/posts/${request.postId}/comments`,
      { content: request.content }
    );

    return response.data.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/comments/${commentId}`);
  }
}
