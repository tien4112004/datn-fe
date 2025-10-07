export interface BorderConfig {
  width: number;
  color: string;
  radius?: number;
}

export interface TextStyleConfig {
  color?: string;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontSize?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface BackgroundConfig {
  color?: string;
  image?: string;
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
