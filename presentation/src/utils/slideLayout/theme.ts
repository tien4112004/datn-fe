import type { PPTElement, PPTElementShadow, SlideTheme } from '@/types/slides';

export interface ExtendedSlideTheme extends SlideTheme {
  additionalElements?: PPTElement[];
  accentImageShape: 'default' | 'big' | 'mixed';
  card: {
    enabled: boolean;
    borderRadius: number;
    borderWidth: number;
    fill: 'none' | 'full' | 'semi';
    shadow: PPTElementShadow;
  };
}
