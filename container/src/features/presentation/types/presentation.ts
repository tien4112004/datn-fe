import type { Slide, SlideTheme } from './slide';

export interface PresentationItem {
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
