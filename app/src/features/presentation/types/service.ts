import type { Service } from '@/shared/api';
import type { OutlineItem, OutlineData } from './outline';
import type {
  Presentation,
  PresentationCollectionRequest,
  SlideLayoutSchema,
  ModelConfig,
} from './presentation';
import type { ApiResponse } from '@aiprimary/api';
import type { Slide, SlideTheme, SlideTemplate, SlideViewport } from './slide';
import type { ArtStyle } from '@/features/image/types';

interface PresentationConfig {
  theme: SlideTheme;
  viewport: SlideViewport;
}

interface ImageOptions {
  artStyle: ArtStyle;
  imageModel: ModelConfig;
}

export interface PresentationGenerationRequest {
  outline: string;
  model: ModelConfig;
  slideCount: number;
  language: string;
  presentation?: PresentationConfig;
  generationOptions?: ImageOptions;
}

export interface PresentationGenerateDraftRequest {
  presentation: PresentationConfig;
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
  /**
   * @deprecated
   */
  getPresentationItems(): Promise<Presentation[]>;
  /**
   * @deprecated
   */
  getOutlineItems(): Promise<OutlineItem[]>;
  getStreamedOutline(request: OutlineData, signal: AbortSignal): Promise<{ stream: AsyncIterable<string> }>;
  getPresentations(request: PresentationCollectionRequest): Promise<ApiResponse<Presentation[]>>;
  createPresentation(data: CreatePresentationRequest): Promise<Presentation>;
  getPresentationById(id: string): Promise<Presentation | null>;
  getAiResultById(id: string): Promise<SlideLayoutSchema[]>;
  generatePresentation(request: PresentationGenerationRequest): Promise<PresentationGenerationResponse>;
  updatePresentationTitle(id: string, name: string): Promise<any | null>;
  updatePresentation(id: string, data: UpdatePresentationRequest): Promise<Presentation>;
  getStreamedPresentation(
    request: PresentationGenerationRequest,
    signal: AbortSignal
  ): Promise<{ stream: AsyncIterable<string> } & PresentationGenerationStartResponse>;
  draftPresentation(request: PresentationGenerateDraftRequest): Promise<Presentation>;
  upsertPresentationSlide(id: string, slide: Slide): Promise<Presentation>;
  setPresentationAsParsed(id: string): Promise<Presentation>;
  getSlideThemes(params?: GetSlideThemesParams): Promise<SlideTheme[]>;
  getSlideTemplates(): Promise<SlideTemplate[]>;
}
