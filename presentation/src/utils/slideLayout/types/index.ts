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
  axis: 'horizontal' | 'vertical'; // Which axis to position (other axis inherits from parent)

  // Positioning for the specified axis
  anchor?: 'start' | 'end' | 'center'; // 'start' = left/top, 'end' = right/bottom
  offset?: number; // Offset from anchor point
  size?: number | 'fill'; // Explicit size or 'fill' to fill remaining space
  margin?: PaddingConfig; // Margin to apply when calculating position/size
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

export interface ChildLayoutConfig {
  verticalAlignment?: 'top' | 'center' | 'bottom';
  horizontalAlignment?: 'left' | 'center' | 'right';
  distribution?: DistributionType;
  spacingBetweenItems?: number;
  orientation?: 'horizontal' | 'vertical';
}

export interface ChildrenTemplate {
  count: number | 'auto';
  wrap?: WrapConfig;
  structure?: SlideLayoutBlockConfig;
}

export interface LayoutBlockConfig {
  type: 'block' | 'text' | 'image';
  id?: string;
  padding?: PaddingConfig;
  border?: BorderConfig;
  shadow?: PPTElementShadow;
  label?: string;

  // Child layout configuration
  layout?: ChildLayoutConfig;

  // Template-specific fields
  childTemplate?: ChildrenTemplate;
  children?: SlideLayoutBlockConfig[];
}

export interface ImageLayoutBlockConfig extends LayoutBlockConfig {
  type: 'image';
  // Image-specific config fields
}

export interface TextLayoutBlockConfig extends LayoutBlockConfig {
  type: 'text';
  background?: BackgroundConfig;
  text?: TextStyleConfig;
}

export interface NonTextLayoutBlockConfig extends LayoutBlockConfig {
  type: 'block';
}

export type SlideLayoutBlockConfig =
  | TextLayoutBlockConfig
  | ImageLayoutBlockConfig
  | NonTextLayoutBlockConfig;

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
export interface NonTextTemplateContainer extends NonTextLayoutBlockConfig {
  bounds?: Bounds; // Absolute positioning (higher priority)
  positioning?: RelativePositioning; // Relative positioning (lower priority)
}
export type TemplateContainerConfig =
  | TextTemplateContainer
  | ImageTemplateContainer
  | NonTextTemplateContainer;

// ============================================================================
// Instance Types (Resolved - with computed positions)
// ============================================================================

export interface LayoutBlockInstance {
  type: 'block' | 'text' | 'image';
  id?: string;
  bounds: Bounds;
  padding: PaddingConfig;
  label?: string;
  border?: BorderConfig;
  shadow?: PPTElementShadow;

  // Child layout configuration
  layout?: ChildLayoutConfig;

  // Resolved children (no templates)
  children?: LayoutBlockInstance[];
}

export interface ImageLayoutBlockInstance extends LayoutBlockInstance {
  type: 'image';
  // Image-specific instance fields
}

export interface TextLayoutBlockInstance extends LayoutBlockInstance {
  type: 'text';
  background?: BackgroundConfig;
  text?: TextStyleConfig;
}

export interface NonTextLayoutBlockInstance extends LayoutBlockInstance {
  type: 'block';
}

export type SlideLayoutBlockInstance =
  | TextLayoutBlockInstance
  | ImageLayoutBlockInstance
  | NonTextLayoutBlockInstance;

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
