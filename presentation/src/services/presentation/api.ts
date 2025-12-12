import { getApiServiceFactory } from '@aiprimary/api';
import { PresentationApiService } from './real';
import { MockPresentationApiService } from './mock';
import type { PresentationGenerationRequest, PresentationGenerationStartResponse } from './types';
import { getBackendUrl } from '@aiprimary/api';
import type { Presentation } from '@aiprimary/core';

const BASE_URL = getBackendUrl();

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
