export interface CreateImageFormData {
  topic: string;
  model: {
    name: string;
    provider: string;
  };
  imageDimension: string;
  artStyle: string;
  negativePrompt: string;
}
