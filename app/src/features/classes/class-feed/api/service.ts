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

export default class ClassFeedRealApiService implements ClassFeedApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getPosts(classId: string, filter?: FeedFilter, page = 1, pageSize = 20): Promise<PostListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (filter) {
      if (filter.type !== 'all') params.append('type', filter.type);
      if (filter.search) params.append('search', filter.search);
      if (filter.startDate) params.append('startDate', filter.startDate.toISOString());
      if (filter.endDate) params.append('endDate', filter.endDate.toISOString());
    }

    const response = await fetch(`${this.baseUrl}/${classId}/feed?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    return response.json();
  }

  async createPost(request: PostCreateRequest): Promise<Post> {
    const formData = new FormData();
    formData.append('classId', request.classId);
    formData.append('type', request.type);
    if (request.title) formData.append('title', request.title);
    formData.append('content', request.content);

    if (request.attachments) {
      request.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await fetch(`${this.baseUrl}/${request.classId}/feed`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async updatePost(request: PostUpdateRequest): Promise<Post> {
    const formData = new FormData();
    formData.append('content', request.content);

    if (request.attachments) {
      request.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await fetch(`${this.baseUrl}/feed/${request.id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to update post: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async deletePost(postId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/feed/${postId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.statusText}`);
    }
  }

  async pinPost(postId: string, pinned: boolean): Promise<Post> {
    const response = await fetch(`${this.baseUrl}/feed/${postId}/pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pinned }),
    });

    if (!response.ok) {
      throw new Error(`Failed to ${pinned ? 'pin' : 'unpin'} post: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getComments(postId: string): Promise<Comment[]> {
    const response = await fetch(`${this.baseUrl}/feed/${postId}/comments`);
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || result;
  }

  async createComment(request: CommentCreateRequest): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/feed/${request.postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: request.content }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create comment: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/feed/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update comment: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/feed/comments/${commentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete comment: ${response.statusText}`);
    }
  }
}
