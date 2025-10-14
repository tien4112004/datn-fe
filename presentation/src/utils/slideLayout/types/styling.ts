import type { Gradient } from '@/types/slides';

export interface FontSizeRange {
  minSize: number;
  maxSize: number;
}

export interface BorderConfig {
  width: number | string;
  color: string;
  radius?: number | string;
  directions?: ('top' | 'right' | 'bottom' | 'left')[];
}

export interface ShadowConfig {
  h: number | string;
  v: number | string;
  blur: number | string;
  color: string;
}

export interface BorderInstance {
  width: number;
  color: string;
  radius?: number;
  directions: ('top' | 'right' | 'bottom' | 'left')[];
}

export interface ShadowInstance {
  h: number;
  v: number;
  blur: number;
  color: string;
}

export const fromBorderConfigToInstance = (config?: BorderConfig): BorderInstance | undefined => {
  if (!config) return undefined;
  return {
    width: typeof config.width === 'number' ? config.width : parseFloat(config.width),
    color: config.color,
    radius: typeof config.radius === 'number' ? config.radius : parseFloat(config.radius || '0'),
    directions: config.directions || ['top', 'right', 'bottom', 'left'],
  };
};

export const fromShadowConfigToInstance = (config?: ShadowConfig): ShadowInstance | undefined => {
  if (!config) return undefined;
  return {
    h: typeof config.h === 'number' ? config.h : parseFloat(config.h),
    v: typeof config.v === 'number' ? config.v : parseFloat(config.v),
    blur: typeof config.blur === 'number' ? config.blur : parseFloat(config.blur),
    color: config.color,
  };
};

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
  snake?: boolean; // Reverse item order in odd rows for snake/zigzag pattern (e.g., 1->2->3->4, 8<-7<-6<-5)
  zigzag?: boolean; // Stagger items across two rows alternately (e.g., 1  3  5 / 2  4  6)
}
