import type { PPTElementShadow, SlideTheme } from '@/types/slides';

// ============================================================================
// Base Types
// ============================================================================

export interface Position {
  left: number;
  top: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Position, Size {}

export interface PaddingConfig {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

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
}

export interface BackgroundConfig {
  color?: string;
  image?: string;
}

// ============================================================================
// Config Types (Templates - no positioning)
// ============================================================================

export interface LayoutBlockConfig {
  id?: string;
  padding?: PaddingConfig;
  border?: BorderConfig;
  shadow?: PPTElementShadow;
  verticalAlignment?: 'top' | 'center' | 'bottom';
  horizontalAlignment?: 'left' | 'center' | 'right';
  distribution?: 'equal' | 'space-around' | 'space-between';
  orientation?: 'horizontal' | 'vertical';
  spacingBetweenItems?: number;

  // Template-specific fields
  childTemplate?: {
    label?: string;
    count: number | 'auto';
    structure?: SlideLayoutBlockConfig;
  };
  children?: SlideLayoutBlockConfig[];
}

export interface ImageLayoutBlockConfig extends LayoutBlockConfig {
  // Image-specific config fields
}

export interface TextLayoutBlockConfig extends LayoutBlockConfig {
  background?: BackgroundConfig;
  text?: TextStyleConfig;
}

export type SlideLayoutBlockConfig = TextLayoutBlockConfig | ImageLayoutBlockConfig;

// ============================================================================
// Template Container Types (Config with Bounds)
// ============================================================================

export interface TextTemplateContainer extends TextLayoutBlockConfig {
  bounds: Bounds;
}
export interface ImageTemplateContainer extends ImageLayoutBlockConfig {
  bounds: Bounds;
}
export type TemplateContainerConfig = TextTemplateContainer | ImageTemplateContainer;

// ============================================================================
// Instance Types (Resolved - with computed positions)
// ============================================================================

export interface LayoutBlockInstance extends Bounds {
  id?: string;
  padding: PaddingConfig;
  border?: BorderConfig;
  shadow?: PPTElementShadow;
  verticalAlignment?: 'top' | 'center' | 'bottom';
  horizontalAlignment?: 'left' | 'center' | 'right';
  distribution?: 'equal' | 'space-around' | 'space-between';
  orientation?: 'horizontal' | 'vertical';
  spacingBetweenItems?: number;

  // Resolved children (no templates)
  children?: LayoutBlockInstance[];
}

export interface ImageLayoutBlockInstance extends LayoutBlockInstance {
  // Image-specific instance fields
}

export interface TextLayoutBlockInstance extends LayoutBlockInstance {
  background?: BackgroundConfig;
  text?: TextStyleConfig;
}

export type SlideLayoutBlockInstance = TextLayoutBlockInstance | ImageLayoutBlockInstance;

// ============================================================================
// Template Config
// ============================================================================

export interface TemplateConfig {
  containers: Record<string, TemplateContainerConfig>;
  theme: SlideTheme;
}

export interface TemplateInstance {
  containers: Record<string, SlideLayoutBlockInstance>;
  theme: SlideTheme;
}
