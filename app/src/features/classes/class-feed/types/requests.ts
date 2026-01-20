// Request types
export interface PostCreateRequest {
  classId: string;
  type: 'Post' | 'Homework';
  content: string;
  attachments?: File[];
  linkedResourceIds?: string[];
  linkedLessonId?: string; // Note: singular, not plural
  assignmentId?: string; // For Homework type posts
  allowComments?: boolean;
}

export interface PostUpdateRequest {
  id: string;
  content?: string;
  type?: 'Post' | 'Homework';
  attachments?: File[];
  linkedResourceIds?: string[];
  linkedLessonId?: string;
  assignmentId?: string; // For Homework type posts
  isPinned?: boolean;
  allowComments?: boolean;
}

export interface CommentCreateRequest {
  postId: string;
  content: string;
}

// Feed Filter
export interface FeedFilter {
  type: 'all' | 'Post' | 'Homework';
  search?: string;
  startDate?: Date;
  endDate?: Date;
}
