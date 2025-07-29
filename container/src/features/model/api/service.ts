import { API_MODE, type ApiMode } from '@/shared/constants';
import type { ModelApiService, ModelOption } from '../types';
// import api from '@/shared/api';

const realApiModels: ModelOption[] = [
  { id: 'gpt-4o-mini', name: 'gpt-4o-mini', displayName: 'GPT-4o Mini' },
  { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
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
}
