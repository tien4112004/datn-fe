import type { ArtStyle } from './constants';

export interface CreateImageFormData {
  topic: string;
  model: {
    name: string;
    provider: string;
  };
  imageDimension: string;
  artStyle: ArtStyle;
  negativePrompt: string;
}
