import type { Service } from '@/shared/api';
import type { DemoItem } from './demo';

export interface DemoApiService extends Service {
  getDemoItems(): Promise<DemoItem[]>;
}
