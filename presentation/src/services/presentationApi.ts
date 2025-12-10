import { getApiServiceFactory } from '@aiprimary/api';
import { PresentationApiService } from './presentation';
import { MockPresentationApiService } from './presentation-mock';
import type {
  Presentation,
  PresentationGenerationRequest,
  PresentationGenerationStartResponse,
} from './types';

// Re-export types
export type { Presentation, PresentationGenerationRequest, PresentationGenerationStartResponse };
export type { Slide, SlideTheme, SlideLayoutSchema } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface IPresentationApi {
  getAiResultById(id: string): Promise<any[]>;
  upsertSlide(presentationId: string, slide: any): Promise<Presentation>;
  setParsed(id: string): Promise<Presentation>;
  streamPresentation(
    request: PresentationGenerationRequest,
    signal: AbortSignal
  ): Promise<{ stream: AsyncIterable<string> } & PresentationGenerationStartResponse>;
  getPresentation(id: string): Promise<Presentation>;
  updatePresentation(id: string, data: Presentation): Promise<Presentation>;
}

/**
 * Get a presentation API service instance based on current API mode
 * Used with traditional JavaScript (non-reactive)
 */
export const getPresentationApi = (): IPresentationApi => {
  return getApiServiceFactory<any>(MockPresentationApiService, PresentationApiService, BASE_URL);
};
