// Minimal slide types needed for frontend-data package
// These types are copied from @aiprimary/core package to avoid circular dependencies

export type GradientType = 'linear' | 'radial';

export interface GradientColor {
  color: string;
  pos: number;
}

export interface Gradient {
  type: GradientType;
  colors: GradientColor[];
  rotate: number;
}

export interface PPTElementOutline {
  style: 'solid' | 'dashed' | 'dotted';
  width: number;
  color: string;
}

export interface PPTElementShadow {
  h: number;
  v: number;
  blur: number;
  color: string;
}

export interface PPTElement {
  // Minimal interface - add properties as needed
  [key: string]: any;
}

/**
 * Slide theme configuration
 */
export interface SlideTheme {
  id?: string;
  name?: string;
  modifiers?: string | null;
  backgroundColor: string | Gradient;
  themeColors: string[];
  fontColor: string;
  fontName: string;
  titleFontName: string;
  titleFontColor: string;
  outline: PPTElementOutline;
  shadow: PPTElementShadow;
  labelFontColor?: string;
  labelFontName?: string;

  // For Layouts
  additionalElements?: PPTElement[];
  accentImageShape?: 'default' | 'big' | 'mixed';
  card?: {
    enabled: boolean;
    borderRadius: number;
    borderWidth: number;
    fill: 'none' | 'full' | 'semi';
  };
}
