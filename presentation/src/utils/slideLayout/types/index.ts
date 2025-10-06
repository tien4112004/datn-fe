import type { PPTElement, PPTElementShadow, SlideTheme } from '@/types/slides';
import type { BoundsExpression } from './expressions';

// Export expression types
export * from './expressions';

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
  margin?: { top?: number; bottom?: number; left?: number; right?: number }; // Margin to apply when calculating position/size
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
  gap?: number;
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
  bounds?: Bounds | BoundsExpression; // Absolute positioning (higher priority) - can be computed or expression
  positioning?: RelativePositioning; // Relative positioning (lower priority)
  optional?: boolean; // Skip this container if data is missing
}
export interface ImageTemplateContainer extends ImageLayoutBlockConfig {
  bounds?: Bounds | BoundsExpression; // Absolute positioning (higher priority) - can be computed or expression
  positioning?: RelativePositioning; // Relative positioning (lower priority)
  optional?: boolean; // Skip this container if data is missing
}
export interface NonTextTemplateContainer extends NonTextLayoutBlockConfig {
  bounds?: Bounds | BoundsExpression; // Absolute positioning (higher priority) - can be computed or expression
  positioning?: RelativePositioning; // Relative positioning (lower priority)
  optional?: boolean; // Skip this container if data is missing
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

/**
 * Resolved template configuration with theme and viewport
 */
export interface TemplateConfig {
  containers: Record<string, TemplateContainerConfig>;
  theme: SlideTheme;
  viewport: SlideViewport;
}

/**
 * Partial template definition without theme/viewport
 * Used for templates with {{theme.xxx}} placeholders that need resolution
 */
export type PartialTemplateConfig = Omit<TemplateConfig, 'theme' | 'viewport'>;

/**
 * Template instance with resolved bounds and theme
 */
export interface TemplateInstance {
  containers: Record<string, SlideLayoutBlockInstance>;
  theme: SlideTheme;
  viewport: SlideViewport;
}

// ============================================================================
// Unified Font Sizing Types
// ============================================================================

export interface ConvergenceOptions {
  minFontSize?: number; // Default: 8
  labelToValueRatio?: number; // Default: 1.2 (label should be 1.2x bigger)
}
