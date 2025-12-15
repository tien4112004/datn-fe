import type { SlideTheme, ModelConfig } from '@aiprimary/core';

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

interface PresentationConfig {
  theme: SlideTheme;
  viewport: {
    width: number;
    height: number;
  };
}

interface ImageOptions {
  artStyle: ArtStyle;
  imageModel: ModelConfig;
}

export interface PresentationGenerationRequest {
  presentationId: string;
  outline: string;
  model: ModelConfig;
  slideCount: number;
  language: string;
  presentation: PresentationConfig;
  generationOptions?: ImageOptions;
}

export interface PresentationGenerationStartResponse {
  presentationId: string;
  error?: unknown;
}
