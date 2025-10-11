import type { Service } from '@/shared/api';
import type { OutlineItem, OutlineData } from './outline';
import type { Presentation, PresentationCollectionRequest, SlideLayoutSchema } from './presentation';
import type { ApiResponse } from '@/types/api';
import type { Slide, SlideTheme, SlideViewport } from './slide';

export interface PresentationGenerationRequest {
  outline: string;
  model: {
    name: string;
    provider: string;
  };
  slideCount: number;
  language: string;
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
  getStreamedPresentation(
    request: PresentationGenerationRequest,
    signal: AbortSignal
  ): Promise<{ stream: AsyncIterable<string> } & PresentationGenerationStartResponse>;
  upsertPresentationSlide(id: string, slide: Slide): Promise<Presentation>;
  setPresentationAsParsed(id: string): Promise<Presentation>;
}
