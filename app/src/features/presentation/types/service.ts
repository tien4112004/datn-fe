import type { Service } from '@/shared/api';
import type { ApiResponse } from '@aiprimary/api';
import type { OutlineData } from './outline';
import type {
  Presentation,
  PresentationCollectionRequest,
  SlideLayoutSchema,
  ModelConfig,
  SlideTheme,
  SlideTemplate,
  Slide,
  SlideViewport,
} from '@aiprimary/core';
import type { User, SharedUserApiResponse, ShareRequest, ShareResponse } from './share';

export interface PresentationConfig {
  theme: SlideTheme;
  viewport: SlideViewport;
}

export interface ImageOptions {
  artStyle: string;
  artStyleModifiers?: string;
  imageModel: ModelConfig;
}

export interface PresentationGenerationRequest {
  outline: string;
  model: ModelConfig;
  slideCount: number;
  language: string;
  presentation?: PresentationConfig;
  generationOptions?: ImageOptions;
  topic?: string;
}

export interface PresentationGenerateDraftRequest {
  presentation: PresentationConfig;
  topic?: string;
}

export interface PresentationGenerationResponse {
  aiResult: SlideLayoutSchema[];
  presentation: Presentation;
}

export interface PresentationGenerationStartResponse {
  presentationId: string;
  error?: unknown;
}

export type CreatePresentationRequest = Omit<Presentation, 'id' | 'createdAt' | 'updatedAt'>;
export interface UpdatePresentationRequest {
  title?: string;
  slides?: Slide[];
  theme?: SlideTheme;
  viewport?: SlideViewport;
  thumbnail?: string;
}

export interface GetSlideThemesParams {
  page?: number;
  pageSize?: number;
}

export interface PresentationApiService extends Service {
  getStreamedOutline(request: OutlineData, signal: AbortSignal): Promise<{ stream: AsyncIterable<string> }>;
  getPresentations(request: PresentationCollectionRequest): Promise<ApiResponse<Presentation[]>>;
  createPresentation(data: CreatePresentationRequest): Promise<Presentation>;
  getPresentationById(id: string): Promise<Presentation | null>;
  getAiResultById(id: string): Promise<{
    slides: SlideLayoutSchema[];
    generationOptions?: ImageOptions;
  }>;
  updatePresentationTitle(id: string, name: string): Promise<any | null>;
  updatePresentation(id: string, data: UpdatePresentationRequest): Promise<Presentation>;
  deletePresentation(id: string): Promise<void>;
  getSlideThemes(params?: GetSlideThemesParams): Promise<SlideTheme[]>;
  getSlideThemesByIds(ids: string[]): Promise<SlideTheme[]>;
  getSlideTemplates(): Promise<SlideTemplate[]>;
  // Sharing methods
  searchUsers(query: string): Promise<User[]>;
  sharePresentation(id: string, shareData: ShareRequest): Promise<ShareResponse>;
  getSharedUsers(id: string): Promise<SharedUserApiResponse[]>;
  revokeAccess(presentationId: string, userId: string): Promise<void>;
}
