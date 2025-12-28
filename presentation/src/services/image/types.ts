export interface GeneratedImage {
  url: string;
  [key: string]: any;
}

export interface ImageGenerationParams {
  prompt: string;
  model: {
    name: string;
    provider: string;
  };
  themeStyle?: string;
  themeDescription?: string;
  artStyle?: string;
  artDescription?: string;
}

export interface ImageGenerationResponse {
  images: Array<{ url: string }>;
}

export interface SingleImageResponse {
  imageUrl: string;
}

export interface ImageSearchPayload {
  query: string;
  orientation?: 'landscape' | 'portrait' | 'square' | 'all';
  locale?: 'zh' | 'en';
  order?: 'popular' | 'latest';
  size?: 'large' | 'medium' | 'small';
  image_type?: 'all' | 'photo' | 'illustration' | 'vector';
  page?: number;
  per_page?: number;
}
