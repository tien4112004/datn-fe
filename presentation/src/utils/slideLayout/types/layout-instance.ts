import type { Bounds } from './base';
import type { BorderConfig, TextStyleConfig, BackgroundConfig, PPTElementShadow } from './styling';
import type { ChildLayoutConfig } from './layout-config';

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
