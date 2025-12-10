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
}

export interface ImageGenerationResponse {
  images: Array<{ url: string }>;
}
