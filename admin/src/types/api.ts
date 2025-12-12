import type { SlideTheme as CoreSlideTheme, SlideTemplate as CoreSlideTemplate } from '@aiprimary/core';

export type GradientType = 'linear' | 'radial';
export type GradientColor = {
  pos: number;
  color: string;
};
export interface Gradient {
  type: GradientType;
  colors: GradientColor[];
  rotate: number;
}

export type LineStyleType = 'solid' | 'dashed' | 'dotted';

export interface PPTElementShadow {
  h: number;
  v: number;
  blur: number;
  color: string;
}

export interface PPTElementOutline {
  style?: LineStyleType;
  width?: number;
  color?: string;
}

// Extended SlideTheme for admin functionality
export interface SlideTheme extends CoreSlideTheme {
  // Additional admin fields
  createdAt?: string;
  updatedAt?: string;
}

// Extended SlideTemplate for admin functionality
export interface SlideTemplate extends CoreSlideTemplate {
  // Additional admin fields
  createdAt?: string;
  updatedAt?: string;
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

export const MODEL_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
} as const;
export type ModelType = (typeof MODEL_TYPES)[keyof typeof MODEL_TYPES];

export interface Model {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  default: boolean;
  provider: string;
  type: ModelType;
}

export interface ModelPatchData {
  enabled?: boolean;
  default?: boolean;
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
