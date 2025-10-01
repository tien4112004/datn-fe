import type { PPTElement, PPTElementShadow, SlideTheme } from '@/types/slides';

// ============================================================================
// Base Types
// ============================================================================

export interface SlideViewport {
  width: number;
  height: number;
}

// ============================================================================
// Relative Positioning Types
// ============================================================================

export interface RelativePositioning {
  relativeTo?: string; // Container ID to position relative to (undefined = viewport)
  anchor?: {
    horizontal?: 'left' | 'right' | 'center' | 'none';
    vertical?: 'top' | 'bottom' | 'center' | 'none';
  };
  offset?: {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  };
  fillRemaining?: {
    horizontal?: boolean;
    vertical?: boolean;
  };
}

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
  distribution?: 'balanced' | 'top-heavy' | 'bottom-heavy';
  alternating?: boolean;
}

export type DistributionType = 'equal' | 'space-between' | 'space-around';

// ============================================================================
// Config Types (Templates - no positioning)
// ============================================================================

export interface LayoutBlockConfig {
  id?: string;
  padding?: PaddingConfig;
  border?: BorderConfig;
  shadow?: PPTElementShadow;
  label?: string;
  verticalAlignment?: 'top' | 'center' | 'bottom';
  horizontalAlignment?: 'left' | 'center' | 'right';
  distribution?: DistributionType;
  orientation?: 'horizontal' | 'vertical';
  spacingBetweenItems?: number;

  // Template-specific fields
  childTemplate?: {
    count: number | 'auto';
    wrap?: WrapConfig;
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
// Template Container Types (Config with Bounds or Relative Positioning)
// ============================================================================

export interface TextTemplateContainer extends TextLayoutBlockConfig {
  bounds?: Bounds; // Absolute positioning (higher priority)
  positioning?: RelativePositioning; // Relative positioning (lower priority)
}
export interface ImageTemplateContainer extends ImageLayoutBlockConfig {
  bounds?: Bounds; // Absolute positioning (higher priority)
  positioning?: RelativePositioning; // Relative positioning (lower priority)
}
export type TemplateContainerConfig = TextTemplateContainer | ImageTemplateContainer;

// ============================================================================
// Instance Types (Resolved - with computed positions)
// ============================================================================

export interface LayoutBlockInstance {
  id?: string;
  bounds: Bounds;
  padding: PaddingConfig;
  label?: string;
  border?: BorderConfig;
  shadow?: PPTElementShadow;
  verticalAlignment?: 'top' | 'center' | 'bottom';
  horizontalAlignment?: 'left' | 'center' | 'right';
  distribution?: DistributionType;
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

// ============================================================================
// Unified Font Sizing Types
// ============================================================================

export interface ConvergenceOptions {
  minFontSize?: number; // Default: 8
  labelToValueRatio?: number; // Default: 1.2 (label should be 1.2x bigger)
}
