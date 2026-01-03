import type { Post } from './post';

// Request types
export interface PostCreateRequest {
  classId: string;
  type: 'general' | 'announcement' | 'schedule_event';
  content: string;
  attachments?: File[];
  linkedResourceIds?: string[];
  linkedLessonId?: string; // Note: singular, not plural
  allowComments?: boolean;
}

export interface PostUpdateRequest {
  id: string;
  content?: string;
  type?: 'general' | 'announcement' | 'schedule_event';
  attachments?: File[];
  linkedResourceIds?: string[];
  linkedLessonId?: string;
  isPinned?: boolean;
  allowComments?: boolean;
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
  type: 'all' | 'general' | 'announcement' | 'schedule_event';
  search?: string;
  startDate?: Date;
  endDate?: Date;
}
