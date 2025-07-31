import type { Service } from '@/shared/api';
import type { ModelOption } from './model';

export interface ModelApiService extends Service {
  getAvailableModels(): Promise<ModelOption[]>;
  getDefaultModel(): Promise<ModelOption>;
}
