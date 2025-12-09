import type { Service } from '@/shared/api';
import type { OutlineItem, OutlineData } from './outline';
import type { Presentation, PresentationCollectionRequest, SlideLayoutSchema } from './presentation';
import type { ApiResponse } from '@aiprimary/api';
import type { Slide, SlideTheme, SlideTemplate, SlideViewport } from './slide';

export interface PresentationGenerationRequest {
  outline: string;
  model: {
    name: string;
    provider: string;
  };
  slideCount: number;
  language: string;
  /** @deprecated */
  presentation: {
    theme: SlideTheme;
    viewport: SlideViewport;
  };

  // This field is not used in the backend
  others: {
    contentLength: string;
    imageModel: {
      name: string;
      provider: string;
    };
  };
}

export interface PresentationGenerateDraftRequest {
  presentation: {
    theme: SlideTheme;
    viewport: SlideViewport;
  };
}

export interface PresentationGenerationResponse {
  aiResult: SlideLayoutSchema[];
  presentation: Presentation;
}

export interface PresentationGenerationStartResponse {
  presentationId: string;
  error?: unknown;
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
  createPresentation(data: Presentation): Promise<Presentation>;
  getPresentationById(id: string): Promise<Presentation | null>;
  getAiResultById(id: string): Promise<SlideLayoutSchema[]>;
  generatePresentation(request: PresentationGenerationRequest): Promise<PresentationGenerationResponse>;
  updatePresentationTitle(id: string, name: string): Promise<any | null>;
  updatePresentation(id: string, data: Presentation): Promise<Presentation>;
  getStreamedPresentation(
    request: PresentationGenerationRequest,
    signal: AbortSignal
  ): Promise<{ stream: AsyncIterable<string> } & PresentationGenerationStartResponse>;
  draftPresentation(request: PresentationGenerateDraftRequest): Promise<Presentation>;
  upsertPresentationSlide(id: string, slide: Slide): Promise<Presentation>;
  setPresentationAsParsed(id: string): Promise<Presentation>;
  getSlideThemes(): Promise<SlideTheme[]>;
  getSlideTemplates(): Promise<SlideTemplate[]>;
}
