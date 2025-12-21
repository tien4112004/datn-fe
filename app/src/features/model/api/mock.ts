import { API_MODE, type ApiMode } from '@aiprimary/api';
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
        const model = [...mockTextModels, ...mockImageModels].find((model) => model.id === modelId);
        if (!model) {
          throw new Error(`Model with id ${modelId} not found`);
        }

        if (model.type === 'TEXT') {
          const updatedModel = this.updateModelStatus(mockTextModels, modelId, data);
          return resolve({ ...updatedModel });
        } else if (model.type === 'IMAGE') {
          const updatedModel = this.updateModelStatus(mockImageModels, modelId, data);
          return resolve({ ...updatedModel });
        }
      }, 300);
    });
  }

  private updateModelStatus(mockModels: Model[], modelId: string, data: ModelPatchData): Model {
    const modelIndex = mockModels.findIndex((model) => model.id === modelId);
    if (modelIndex === -1) {
      throw new Error(`Model with id ${modelId} not found`);
    }

    // If setting a model as default, unset other defaults first
    if (data.default === true) {
      mockModels.forEach((model) => {
        model.default = false;
      });
    }

    // Update the model
    mockModels[modelIndex] = {
      ...mockModels[modelIndex],
      ...data,
    };
    return mockModels[modelIndex];
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
    type: 'TEXT',
  },
  {
    id: 'gpt-4o-mini-2024-07-18',
    name: 'gpt-4o-mini-2024-07-18',
    displayName: 'GPT-4o Mini',
    enabled: true,
    default: false,
    provider: 'OpenAI',
    type: 'TEXT',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    enabled: false,
    default: false,
    provider: 'Google',
    type: 'TEXT',
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
    type: 'IMAGE',
  },
  {
    id: 'dall-e-2',
    name: 'dall-e-2',
    displayName: 'DALL-E 2',
    enabled: true,
    default: false,
    provider: 'OpenAI',
    type: 'IMAGE',
  },
  {
    id: 'midjourney-v6',
    name: 'midjourney-v6',
    displayName: 'Midjourney v6',
    enabled: false,
    default: false,
    provider: 'Midjourney',
    type: 'IMAGE',
  },
  {
    id: 'mock',
    name: 'mock',
    displayName: 'Mock Image',
    enabled: true,
    default: false,
    provider: 'Mock',
    type: 'IMAGE',
  },
];
