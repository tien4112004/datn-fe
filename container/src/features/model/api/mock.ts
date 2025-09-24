import { API_MODE, type ApiMode } from '@/shared/constants';
import type { ModelApiService, Model, ModelPatchData, ModelType } from '../types';

export default class ModelMockService implements ModelApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  async getModels(type: ModelType | null): Promise<Model[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allModels = [...mockTextModels, ...mockImageModels];
    if (type) {
      return allModels.filter((model) => model.type === type);
    }
    return allModels;
  }

  async getDefaultModel(type: ModelType): Promise<Model> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allModels = [...mockTextModels, ...mockImageModels];
    return allModels.find((model) => model.default && model.type === type) as Model;
  }

  async patchModel(modelId: string, data: ModelPatchData): Promise<Model> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const modelIndex = mockTextModels.findIndex((model) => model.id === modelId);
        if (modelIndex === -1) {
          throw new Error(`Model with id ${modelId} not found`);
        }

        // If setting a model as default, unset other defaults first
        if (data.default === true) {
          if (mockTextModels[modelIndex].type === 'TEXT') {
            mockTextModels.forEach((model) => {
              if (model.type === 'TEXT') {
                model.default = false;
              }
            });
          } else if (mockTextModels[modelIndex].type === 'IMAGE') {
            mockImageModels.forEach((model) => {
              if (model.type === 'IMAGE') {
                model.default = false;
              }
            });
          }
        }

        // Update the model
        mockTextModels[modelIndex] = {
          ...mockTextModels[modelIndex],
          ...data,
        };

        resolve({ ...mockTextModels[modelIndex] });
      }, 300);
    });
  }
}

const mockTextModels: Model[] = [
  {
    id: 'gpt-4.1-nano-2025-04-14',
    name: 'gpt-4.1-nano-2025-04-14',
    displayName: 'GPT-4.1 Nano',
    enabled: true,
    default: true,
    provider: 'OpenAI',
    type: 'text',
  },
  {
    id: 'gpt-4o-mini-2024-07-18',
    name: 'gpt-4o-mini-2024-07-18',
    displayName: 'GPT-4o Mini',
    enabled: true,
    default: false,
    provider: 'OpenAI',
    type: 'text',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    enabled: false,
    default: false,
    provider: 'Google',
    type: 'text',
  },
];

const mockImageModels: Model[] = [
  {
    id: 'dall-e-3',
    name: 'dall-e-3',
    displayName: 'DALL-E 3',
    enabled: true,
    default: true,
    provider: 'OpenAI',
    type: 'image',
  },
  {
    id: 'dall-e-2',
    name: 'dall-e-2',
    displayName: 'DALL-E 2',
    enabled: true,
    default: false,
    provider: 'OpenAI',
    type: 'image',
  },
  {
    id: 'midjourney-v6',
    name: 'midjourney-v6',
    displayName: 'Midjourney v6',
    enabled: false,
    default: false,
    provider: 'Midjourney',
    type: 'image',
  },
];
