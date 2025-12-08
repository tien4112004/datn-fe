import type { Post } from './post';

// Request types
export interface PostCreateRequest {
  classId: string;
  type: 'post' | 'announcement';
  content: string;
  attachments?: File[];
  linkedLessonIds?: string[];
  linkedResourceIds?: string[];
}

export interface PostUpdateRequest {
  id: string;
  content: string;
  attachments?: File[];
}

export interface CommentCreateRequest {
  postId: string;
  content: string;
}

// Response types
export interface PostResponse {
  data: Post;
  success: boolean;
}

export interface PostListResponse {
  data: Post[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
}

// Feed Filter
export interface FeedFilter {
  type: 'all' | 'posts' | 'announcements';
  search?: string;
  startDate?: Date;
  endDate?: Date;
}
