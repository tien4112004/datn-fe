import type { Service } from '@/shared/api/base-service';
import type { Comment, Post } from './index';
import type {
  CommentCreateRequest,
  FeedFilter,
  PostCreateRequest,
  PostListResponse,
  PostUpdateRequest,
} from './requests';

export interface ClassFeedApiService extends Service {
  // Posts
  getPosts(classId: string, filter?: FeedFilter, page?: number, pageSize?: number): Promise<PostListResponse>;
  createPost(request: PostCreateRequest): Promise<Post>;
  updatePost(request: PostUpdateRequest): Promise<Post>;
  deletePost(postId: string): Promise<void>;
  pinPost(postId: string, pinned: boolean): Promise<Post>;

  // Comments
  getComments(postId: string): Promise<Comment[]>;
  createComment(request: CommentCreateRequest): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
}
