import type { Slide, SlideTheme } from './slide';

export interface Presentation {
  id: string;
  title: string;
  width?: number;
  height?: number;
  theme?: SlideTheme;
  thumbnail?: Slide;
  slides?: Slide[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface PresentationCollectionRequest {
  page?: number;
  pageSize?: number;
  filter?: string;
  sortBy?: 'createdAt'; // API only supports sorting by createdAt for now
  sort?: 'asc' | 'desc';
}
