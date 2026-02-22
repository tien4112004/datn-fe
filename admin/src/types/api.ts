// Request type for creating/updating art styles - visual accepts base64 data URI
export interface ArtStyleRequest {
  id?: string;
  name: string;
  labelKey: string;
  visual?: string; // base64 data URI (e.g., "data:image/png;base64,...")
  modifiers?: string;
}

export type TemplateParameter = NumberParameter | BooleanParameter;

export interface NumberParameter {
  type?: 'number';
  key: string;
  label: string;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export interface BooleanParameter {
  type: 'boolean';
  key: string;
  label: string;
  defaultValue: boolean;
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

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface ContextFilterParams extends PaginationParams {
  search?: string;
  subject?: string[];
  grade?: string[];
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface UserQueryParams extends PaginationParams {
  search?: string;
}

export interface SlideTemplateParams extends PaginationParams {
  layout?: string;
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

// Matrix Template Types
export interface MatrixDimensions {
  topics: { id: string; name: string; chapters?: string[] }[];
  difficulties: string[]; // lowercase: "knowledge", "comprehension", "application"
  questionTypes: string[]; // lowercase: "multiple_choice", "fill_in_blank", etc.
}

export interface MatrixTemplate {
  id: string;
  title: string;
  grade: string | null;
  subject: string | null;
  createdAt: string;
  updatedAt: string;
  dimensions: MatrixDimensions;
  matrix: string[][][]; // 3D: [topic][difficulty][questionType] = "count:points"
  totalQuestions: number;
  totalPoints: number;
}

export interface MatrixTemplateParams extends PaginationParams {
  search?: string;
}
