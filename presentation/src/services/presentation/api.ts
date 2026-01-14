import { getApiServiceFactory, webViewApi } from '@aiprimary/api';
import { PresentationApiService } from './service';
import { MockPresentationApiService } from './mock';
import type {
  PresentationGenerationRequest,
  PresentationGenerationStartResponse,
  SharedUserApiResponse,
  SearchUserApiResponse,
  SharePresentationRequest,
} from './types';
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
  getSlideThemes(params?: { page?: number; limit?: number }): Promise<{
    data: SlideTheme[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }>;
  // Sharing methods
  getSharedUsers(presentationId: string): Promise<SharedUserApiResponse[]>;
  searchUsers(query: string): Promise<SearchUserApiResponse[]>;
  sharePresentation(presentationId: string, request: SharePresentationRequest): Promise<void>;
  revokeAccess(presentationId: string, userId: string): Promise<void>;
}

/**
 * Get a presentation API service instance based on current API mode
 * Used with traditional JavaScript (non-reactive)
 */
export const getPresentationApi = (): IPresentationApi => {
  return getApiServiceFactory<any>(MockPresentationApiService, PresentationApiService, BASE_URL);
};

/**
 * Get presentation API service configured for WebView usage (no credentials/cookies).
 * Use this for embedded pages like GenerationRemoteApp that run in Flutter WebView.
 */
export const getPresentationWebViewApi = (): IPresentationApi => {
  // Always use real API service for webview (no mock support needed)
  return new PresentationApiService(BASE_URL, webViewApi);
};
