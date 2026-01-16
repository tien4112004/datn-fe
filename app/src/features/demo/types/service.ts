import type { DemoItem } from './demo';

export interface DemoApiService {
  getDemoItems(): Promise<DemoItem[]>;
}
