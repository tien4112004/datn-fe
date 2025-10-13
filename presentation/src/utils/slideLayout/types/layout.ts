import type { Bounds } from './base';
import type {
  BorderConfig,
  TextStyleConfig,
  BackgroundConfig,
  WrapConfig,
  ShadowConfig,
  BorderInstance,
  ShadowInstance,
} from './styling';

/**
 * Distribution strategies for laying out children within a container
 * - 'equal': Divide space equally with fixed gaps
 * - 'space-between': Items at edges, equal space between
 * - 'space-around': Equal space around each item
 * - Ratio (e.g., '30/70', '1/2/1'): Proportional sizing
 */
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
// Config types define the TEMPLATE/STRUCTURE without resolved bounds.
// They are transformed into Instance types during layout resolution.
// ============================================================================

export interface ChildLayoutConfig {
  verticalAlignment?: VerticalAlignment;
  horizontalAlignment?: HorizontalAlignment;
  distribution?: DistributionType;
  gap?: number;
  orientation?: Orientation;
}

/**
 * Template for dynamically generating child elements
 * Enables data-driven child creation (e.g., create N items from an array)
 */
export interface ChildrenTemplate {
  /** Number of children to generate ('auto' = based on data length) */
  count: number | 'auto';
  /** Wrapping configuration for multi-line layouts */
  wrap?: WrapConfig;
  /** Structure template to apply to each generated child */
  structure?: SlideLayoutBlockConfig;
}

export interface LayoutBlockConfig {
  type: 'block' | 'text' | 'image';
  id?: string;
  border?: BorderConfig;
  shadow?: ShadowConfig;
  background?: BackgroundConfig;
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
  combined?: {
    enabled: boolean; // Whether to combine multiple text items into one
    pattern: string; // Pattern to combine multiple text items into one (e.g., "{0}. {1}")
    ordered?: boolean; // Whether to use ordered (numbered) list when combining
    wrapping?: boolean; // Whether to enable column wrapping if content exceeds bounds
  };
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
// Instance types represent the FINAL layout with all bounds calculated.
// Templates are expanded, positioning is resolved, and bounds are assigned.
// ============================================================================

export interface LayoutBlockInstance {
  type: 'block' | 'text' | 'image';
  id?: string;
  bounds: Bounds;
  label?: string;
  border?: BorderInstance;
  shadow?: ShadowInstance;
  background?: BackgroundConfig;

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
  text: TextStyleConfig;
  combined?: {
    enabled: boolean; // Whether to combine multiple text items into one
    pattern: string; // Pattern to combine multiple text items into one (e.g., "{0}. {1}")
    ordered: boolean; // Whether to use ordered (numbered) list when combining
    wrapping?: boolean; // Whether to enable column wrapping if content exceeds bounds
  };
}

export interface NonTextLayoutBlockInstance extends LayoutBlockInstance {
  type: 'block';
}

export type SlideLayoutBlockInstance =
  | TextLayoutBlockInstance
  | ImageLayoutBlockInstance
  | NonTextLayoutBlockInstance;
