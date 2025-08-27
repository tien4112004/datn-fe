import type { Slide, SlideTheme } from './slide';

export interface PresentationItem {
  id: string;
  title: string;
  description?: string; // TODO: Remove after deleting old presentation table
  status?: 'active' | 'inactive'; // TODO: Remove after deleting old presentation table
  width?: number;
  height?: number;
  theme?: SlideTheme;
  thumbnail?: Slide;
  slides?: Slide[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
