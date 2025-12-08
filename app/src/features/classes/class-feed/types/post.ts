// Class Feed Post
export interface Post {
  id: string;
  classId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  type: 'announcement' | 'post'; // Simple types only
  content: string;
  attachments?: Attachment[];
  isPinned: boolean;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Comment on Post
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// File Attachment
export interface Attachment {
  id: string;
  fileName: string;
  fileType: string; // MIME type
  fileSize: number;
  url: string;
  uploadedAt: Date;
}
