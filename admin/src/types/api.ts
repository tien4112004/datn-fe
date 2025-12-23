// Request type for creating/updating art styles - visual accepts base64 data URI
export interface ArtStyleRequest {
  id?: string;
  name: string;
  labelKey: string;
  visual?: string; // base64 data URI (e.g., "data:image/png;base64,...")
  modifiers?: string;
}

export interface TemplateParameter {
  key: string;
  label: string;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export interface FAQPost {
  id?: string;
  title: string;
  content: string;
  category?: string;
  isPublished?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type BookType = 'TEXTBOOK' | 'TEACHERBOOK';

export interface Book {
  id?: string;
  title: string;
  description?: string;
  type: BookType;
  grade?: string;
  subject?: string;
  publisher?: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}
