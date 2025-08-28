import type { Service } from '@/shared/api';
import type { OutlineItem, OutlineData } from './outline';
import type { Presentation, PresentationCollectionRequest } from './presentation';
import type { ApiResponse } from '@/types/api';

export interface PresentationApiService extends Service {
  getPresentationItems(): Promise<Presentation[]>;
  getOutlineItems(): Promise<OutlineItem[]>;
  // getStreamedOutline(request: OutlinePromptRequest, signal: AbortSignal): Promise<ReadableStream<Uint8Array>>;
  getStreamedOutline(request: OutlineData, signal: AbortSignal): AsyncIterable<string>;
  getPresentations(request: PresentationCollectionRequest): Promise<ApiResponse<Presentation[]>>;
  createPresentation(data: Presentation): Promise<Presentation>;
  getPresentationById(id: string): Promise<Presentation | null>;
}
