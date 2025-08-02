import type { Service } from '@/shared/api';
import type { OutlineItem } from './outline';

export interface PresentationApiService extends Service {
  getPresentationItems(): Promise<OutlineItem[]>;
}
