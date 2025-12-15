import type { SlideTheme } from '@/types/slides';

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

export interface PresentationGenerationRequest {
  presentationId: string;
  outline: string;
  model: {
    name: string;
    provider: string;
  };
  slideCount: number;
  language: string;
  presentation: {
    theme: SlideTheme;
    viewport: {
      width: number;
      height: number;
    };
  };
  others: {
    contentLength: string;
    artStyle: ArtStyle;
    imageModel: {
      name: string;
      provider: string;
    };
  };
}

export interface PresentationGenerationStartResponse {
  presentationId: string;
  error?: unknown;
}
