import type { Slide, SlideTheme } from '@/types/slides';
import type { SlideLayoutSchema } from '@/utils/slideLayout/types/schemas';

export type { Slide, SlideTheme, SlideLayoutSchema };

export interface Presentation {
  id: string;
  title: string;
  theme: SlideTheme;
  viewport: {
    width: number;
    height: number;
  };
  slides: Slide[];
  isParsed?: boolean;
  [key: string]: any;
}

export interface PresentationGenerationRequest {
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
