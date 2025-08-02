import type { Service } from '@/shared/api';
import type { OutlineItem } from './outline';
import type { PresentationItem } from './presentation';

export interface PresentationApiService extends Service {
  getPresentationItems(): Promise<PresentationItem[]>;
  getOutlineItems(): Promise<OutlineItem[]>;
}
