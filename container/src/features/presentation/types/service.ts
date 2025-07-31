import type { Service } from '@/shared/api';
import type { PresentationItem } from './presentation';

export interface PresentationApiService extends Service {
  getPresentationItems(): Promise<PresentationItem[]>;
}
