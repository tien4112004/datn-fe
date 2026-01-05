// User minimal info from backend
export interface UserMinimalInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

// Class Feed Post
export interface Post {
  id: string;
  classId: string;
  authorId: string;
  author?: UserMinimalInfo; // User info from backend
  type: 'Post' | 'Assignment';
  content: string;
  attachments?: string[]; // Array of URLs from backend
  linkedResourceIds?: string[];
  linkedLessonId?: string;
  isPinned: boolean;
  allowComments?: boolean;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Comment on Post
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: UserMinimalInfo; // User info from backend
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
