import type { Comment, Post } from './index';
import type { CommentCreateRequest, FeedFilter, PostCreateRequest, PostUpdateRequest } from './requests';
import type { ApiResponse } from '@aiprimary/api';
import type { LinkedResourceResponse } from '@/features/projects/types/resource';

export interface ClassFeedApiService {
  // Posts
  getPosts(
    classId: string,
    filter?: FeedFilter,
    page?: number,
    pageSize?: number
  ): Promise<ApiResponse<Post[]>>;
  getPostById(postId: string): Promise<Post>;
  createPost(request: PostCreateRequest): Promise<Post>;
  updatePost(request: PostUpdateRequest): Promise<Post>;
  deletePost(postId: string): Promise<void>;
  pinPost(postId: string, pinned: boolean): Promise<Post>;

  // Comments
  getComments(postId: string): Promise<Comment[]>;
  createComment(request: CommentCreateRequest): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;

  // Attachments
  uploadAttachment(file: File): Promise<string>;
  uploadAttachments(files: File[]): Promise<string[]>;

  // Resources
  getAllResourcesInClass(classId: string): Promise<LinkedResourceResponse[]>;
}
