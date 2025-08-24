import type { Service } from '@/shared/api';
import type { ModelOption } from './model';

export interface ModelApiService extends Service {
  getModels(): Promise<ModelOption[]>;
  getDefaultModel(): Promise<ModelOption>;
}
