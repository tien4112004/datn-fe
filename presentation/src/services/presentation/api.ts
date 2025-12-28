import { getApiServiceFactory } from '@aiprimary/api';
import { PresentationApiService } from './service';
import { MockPresentationApiService } from './mock';
import type { PresentationGenerationRequest, PresentationGenerationStartResponse } from './types';
import type { ImageGenerationParams } from '../image/types';
import { getBackendUrl } from '@aiprimary/api';
import type { Presentation, SlideTheme, SlideLayoutSchema } from '@aiprimary/core';

const BASE_URL = getBackendUrl();

export interface IPresentationApi {
  getAiResultById(id: string): Promise<{
    slides: SlideLayoutSchema[];
    generationOptions?: Omit<ImageGenerationParams, 'prompt' | 'slideId'>;
  }>;
  upsertSlide(presentationId: string, slide: any): Promise<Presentation>;
  // Upsert multiple slides in a single request
  upsertSlides(presentationId: string, slides: any[]): Promise<Presentation>;
  setParsed(id: string): Promise<Presentation>;
  streamPresentation(
    request: PresentationGenerationRequest,
    signal: AbortSignal
  ): Promise<{ stream: AsyncIterable<string> } & PresentationGenerationStartResponse>;
  getPresentation(id: string): Promise<Presentation>;
  updatePresentation(id: string, data: Partial<Presentation> | FormData): Promise<Presentation>;
  getSlideThemes(): Promise<SlideTheme[]>;
}

/**
 * Get a presentation API service instance based on current API mode
 * Used with traditional JavaScript (non-reactive)
 */
export const getPresentationApi = (): IPresentationApi => {
  return getApiServiceFactory<any>(MockPresentationApiService, PresentationApiService, BASE_URL);
};
