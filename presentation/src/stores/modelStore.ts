import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ModelInfo } from '@/services/model/api';

export const useModelStore = defineStore('model', () => {
  // Default model for AI modifications (TEXT)
  const selectedModel = ref<ModelInfo>({
    name: 'gpt-4o-mini',
    provider: 'openai',
  });

  // IMAGE model for image generation
  const selectedImageModel = ref<ModelInfo>({
    name: 'dall-e-3',
    provider: 'openai',
  });

  // Available IMAGE models (populated by query)
  const imageModels = ref<ModelInfo[]>([]);

  return {
    selectedModel,
    selectedImageModel,
    imageModels,
  };
});
