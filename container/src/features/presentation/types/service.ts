import type { Service } from '@/shared/api';
import type { OutlineItem, OutlineData } from './outline';
import type { Presentation, PresentationCollectionRequest, SlideLayoutSchema } from './presentation';
import type { ApiResponse } from '@/types/api';

export interface PresentationGenerationRequest {
  outline: string;
  theme?: string;
  contentLength?: string;
  imageModel?: string;
}

export interface PresentationGenerationResponse {
  aiResult: SlideLayoutSchema[];
  presentation: Presentation;
}

export interface PresentationApiService extends Service {
  getPresentationItems(): Promise<Presentation[]>;
  getOutlineItems(): Promise<OutlineItem[]>;
  // getStreamedOutline(request: OutlinePromptRequest, signal: AbortSignal): Promise<ReadableStream<Uint8Array>>;
  getStreamedOutline(request: OutlineData, signal: AbortSignal): { stream: AsyncIterable<string> };
  getPresentations(request: PresentationCollectionRequest): Promise<ApiResponse<Presentation[]>>;
  createPresentation(data: Presentation): Promise<Presentation>;
  getPresentationById(id: string): Promise<Presentation | null>;
  getAiResultById(id: string): Promise<SlideLayoutSchema[]>;
  generatePresentation(request: PresentationGenerationRequest): Promise<PresentationGenerationResponse>;
  updatePresentationTitle(id: string, name: string): Promise<any | null>;
  getStreamedPresentation(
    request: PresentationGenerationRequest,
    signal: AbortSignal
  ): { presentationId: string; stream: AsyncIterable<string> };
}
