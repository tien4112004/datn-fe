import type { Service } from '@/shared/api';
import type { OutlineItem, OutlinePromptRequest } from './outline';
import type { PresentationItem } from './presentation';

export interface PresentationApiService extends Service {
  getPresentationItems(): Promise<PresentationItem[]>;
  getOutlineItems(): Promise<OutlineItem[]>;
  getStreamedOutline(request: OutlinePromptRequest, signal: AbortSignal): Promise<ReadableStream<Uint8Array>>;
}
