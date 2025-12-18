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

export interface SlideTheme {
  backgroundColor: string | Gradient;
  themeColors: string[];
  fontColor: string;
  fontName: string;
  outline: PPTElementOutline;
  shadow: PPTElementShadow;
  titleFontName?: string;
  titleFontColor?: string;
  labelFontColor?: string;
  labelFontName?: string;

  // Extended properties
  id?: string;
  name?: string;
  accentImageShape?: 'default' | 'big' | 'mixed';
  card?: {
    enabled: boolean;
    borderRadius: number;
    borderWidth: number;
    fill: 'none' | 'full' | 'semi';
    shadow: PPTElementShadow;
    backgroundColor: string;
    textColor: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SlideTemplate {
  id?: string;
  name: string;
  layout: string;
  config: Record<string, unknown>; // PartialTemplateConfig - template container definitions
  graphics?: Record<string, unknown>[]; // Optional decorative graphics
  parameters?: TemplateParameter[]; // Customizable parameters
  createdAt?: string;
  updatedAt?: string;
}

export interface ArtStyle {
  id?: string;
  name: string;
  labelKey: string;
  visual?: string; // CDN URL in responses
  modifiers?: string;
  isEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Request type for creating/updating art styles - visual accepts base64 data URI
export interface ArtStyleRequest {
  id?: string;
  name: string;
  labelKey: string;
  visual?: string; // base64 data URI (e.g., "data:image/png;base64,...")
  modifiers?: string;
  isEnabled?: boolean;
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
