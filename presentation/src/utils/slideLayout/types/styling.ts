import type { Gradient } from '@/types/slides';

export interface FontSizeRange {
  minSize: number;
  maxSize: number;
}

export interface BorderConfig {
  width: number | string;
  color: string;
  radius?: number | string;
}

export interface ShadowConfig {
  h: number | string;
  v: number | string;
  blur: number | string;
  color: string; // Shadow color
}

export interface TextStyleConfig {
  color?: string;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontSizeRange?: FontSizeRange;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface BackgroundConfig {
  color: string | Gradient;
}

export interface WrapConfig {
  enabled: boolean;
  maxItemsPerLine?: number;
  lineCount?: number | 'auto';
  lineSpacing?: number;
  wrapDistribution?: 'balanced' | 'top-heavy' | 'bottom-heavy';
  alternating?: { start: number; end: number }; // Shrink alternating lines by these pixel offsets (supports negative values)
  syncSize?: boolean; // Use uniform size based on the fullest line
}
