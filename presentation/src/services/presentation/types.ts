import type { SlideTheme } from '@/types/slides';

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
