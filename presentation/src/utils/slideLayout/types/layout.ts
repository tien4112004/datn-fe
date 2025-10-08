import type { PPTElementShadow } from '@/types/slides';
import type { Bounds } from './base';
import type { BorderConfig, TextStyleConfig, BackgroundConfig, WrapConfig } from './styling';

export type DistributionType = 'equal' | 'space-between' | 'space-around' | `${number}/${number}`;
export type HorizontalAlignment = 'left' | 'center' | 'right';
export type VerticalAlignment = 'top' | 'center' | 'bottom';
export type Orientation = 'horizontal' | 'vertical';

// ============================================================================
// Relative Positioning Types
// ============================================================================

export interface RelativePositioning {
  relativeTo?: string; // Container ID to position relative to (undefined = viewport)
  axis: Orientation; // Which axis to position (other axis inherits from parent)

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
  verticalAlignment?: VerticalAlignment;
  horizontalAlignment?: HorizontalAlignment;
  distribution?: DistributionType;
  gap?: number;
  orientation?: Orientation;
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
  numbering?: boolean; // Auto-generate sequential numbers as content
}

export interface NonTextLayoutBlockConfig extends LayoutBlockConfig {
  type: 'block';
}

export type SlideLayoutBlockConfig =
  | TextLayoutBlockConfig
  | ImageLayoutBlockConfig
  | NonTextLayoutBlockConfig;

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
