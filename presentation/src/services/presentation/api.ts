import { api, webViewApi } from '@aiprimary/api';
import { PresentationApiService } from './service';
import type {
  PresentationGenerationRequest,
  PresentationGenerationStartResponse,
  SharedUserApiResponse,
  SearchUserApiResponse,
  SharePresentationRequest,
  PublicAccessRequest,
  PublicAccessResponse,
  ResourcePermissionResponse,
  ShareStateResponse,
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
  // Public access methods
  setPublicAccess(presentationId: string, request: PublicAccessRequest): Promise<PublicAccessResponse>;
  getPublicAccessStatus(presentationId: string): Promise<PublicAccessResponse>;
  /**
   * Get complete share state for initialization
   * Combines shared users, public access settings, and current user permission in a single call
   * Replaces separate calls to getSharedUsers() and getPublicAccessStatus()
   */
  getShareState(presentationId: string): Promise<ShareStateResponse>;
}

/**
 * Get a presentation API service instance
 */
export const getPresentationApi = (): IPresentationApi => {
  return new PresentationApiService(BASE_URL, api);
};

/**
 * Get presentation API service configured for WebView usage (no credentials/cookies).
 * Use this for embedded pages like GenerationRemoteApp that run in Flutter WebView.
 */
export const getPresentationWebViewApi = (): IPresentationApi => {
  return new PresentationApiService(BASE_URL, webViewApi);
};
