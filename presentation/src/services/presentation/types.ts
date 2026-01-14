import type { SlideTheme, ModelConfig } from '@aiprimary/core';
import type { ImageGenerationParams } from '../image/types';

export type ArtStyle =
  | ''
  | 'photorealistic'
  | 'digital-art'
  | 'oil-painting'
  | 'watercolor'
  | 'anime'
  | 'cartoon'
  | 'sketch'
  | 'abstract'
  | 'surreal'
  | 'minimalist';

export interface PresentationConfig {
  theme: SlideTheme;
  viewport: {
    width: number;
    height: number;
  };
}

export interface PresentationGenerationRequest {
  presentationId: string;
  outline: string;
  model: ModelConfig;
  slideCount: number;
  language: string;
  presentation: PresentationConfig;
  generationOptions?: Omit<ImageGenerationParams, 'prompt' | 'slideId'>;
}

export interface PresentationGenerationStartResponse {
  presentationId: string;
  error?: unknown;
}

// Sharing types
export interface SharedUserApiResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  permission: 'read' | 'comment';
}

export interface SearchUserApiResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface SharePresentationRequest {
  targetUserIds: string[];
  permission: 'read' | 'comment';
}
