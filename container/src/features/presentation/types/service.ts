import type { Service } from '@/shared/api';
import type { OutlineItem, OutlineData } from './outline';
import type { Presentation, PresentationCollectionRequest } from './presentation';
import type { ApiResponse } from '@/types/api';

export interface PresentationGenerationRequest {
  outline: string;
  theme?: string;
  contentLength?: string;
  imageModel?: string;
}

export interface PresentationGenerationResponse {
  aiResult: any;
  presentation: Presentation;
}

export interface PresentationApiService extends Service {
  getPresentationItems(): Promise<Presentation[]>;
  getOutlineItems(): Promise<OutlineItem[]>;
  // getStreamedOutline(request: OutlinePromptRequest, signal: AbortSignal): Promise<ReadableStream<Uint8Array>>;
  getStreamedOutline(request: OutlineData, signal: AbortSignal): AsyncIterable<string>;
  getPresentations(request: PresentationCollectionRequest): Promise<ApiResponse<Presentation[]>>;
  createPresentation(data: Presentation): Promise<Presentation>;
  getPresentationById(id: string): Promise<Presentation | null>;
  getAiResultById(id: string): Promise<any>;
  generatePresentation(request: PresentationGenerationRequest): Promise<PresentationGenerationResponse>;
}
