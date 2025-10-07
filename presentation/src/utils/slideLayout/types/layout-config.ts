import type { DistributionType } from './base';
import type {
  BorderConfig,
  TextStyleConfig,
  BackgroundConfig,
  WrapConfig,
  PPTElementShadow,
} from './styling';

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
