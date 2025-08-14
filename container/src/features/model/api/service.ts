import { API_MODE, type ApiMode } from '@/shared/constants';
import type { ModelApiService, ModelOption } from '../types';
// import api from '@/shared/api';

const realApiModels: ModelOption[] = [
  { id: 'gpt-4.1-nano-2025-04-14', name: 'gpt-4.1-nano-2025-04-14', displayName: 'GPT-4.1 Nano' },
  { id: 'gpt-4o-mini-2024-07-18', name: 'gpt-4o-mini-2024-07-18', displayName: 'GPT-4o Mini' },
  { id: 'gemini-2.5-flash', name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash' },
];

export default class ModelRealApiService implements ModelApiService {
  getType(): ApiMode {
    return API_MODE.real;
  }

  async getAvailableModels(): Promise<ModelOption[]> {
    // const response = await api.get<ModelOption[]>('/models');
    // return response.data;
    return new Promise((resolve) => {
      setTimeout(() => resolve([...realApiModels]), 300);
    });
  }

  async getDefaultModel(): Promise<ModelOption> {
    // const response = await api.get<ModelOption>('/models/default');
    // return response.data;
    return new Promise((resolve) => {
      setTimeout(() => resolve(realApiModels[0]), 300);
    });
  }
}
