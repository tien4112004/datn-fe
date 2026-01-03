import type { Service } from '@/shared/api/base-service';
import type { Post, Comment } from './index';
import type {
  PostCreateRequest,
  PostUpdateRequest,
  CommentCreateRequest,
  PostListResponse,
  FeedFilter,
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
