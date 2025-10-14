import type { SlideTheme } from '@/types/slides';
import type { Bounds, SlideViewport } from './base';
import type { BoundsExpression } from './expressions';
import type {
  RelativePositioning,
  TextLayoutBlockConfig,
  ImageLayoutBlockConfig,
  NonTextLayoutBlockConfig,
  SlideLayoutBlockInstance,
} from './layout';
import type { GraphicElement } from '../graphics/types';

// ============================================================================
// Template Container Types (Config with Bounds or Relative Positioning)
// ============================================================================

export interface TextTemplateContainer extends TextLayoutBlockConfig {
  bounds?: Bounds | BoundsExpression; // Absolute positioning (higher priority) - can be computed or expression
  positioning?: RelativePositioning; // Relative positioning (lower priority)
  optional?: boolean; // Skip this container if data is missing
  zIndex?: number; // Layering order (higher = on top)
}

export interface ImageTemplateContainer extends ImageLayoutBlockConfig {
  bounds?: Bounds | BoundsExpression; // Absolute positioning (higher priority) - can be computed or expression
  positioning?: RelativePositioning; // Relative positioning (lower priority)
  optional?: boolean; // Skip this container if data is missing
  zIndex?: number; // Layering order (higher = on top)
}

export interface NonTextTemplateContainer extends NonTextLayoutBlockConfig {
  bounds?: Bounds | BoundsExpression; // Absolute positioning (higher priority) - can be computed or expression
  positioning?: RelativePositioning; // Relative positioning (lower priority)
  optional?: boolean; // Skip this container if data is missing
  zIndex?: number; // Layering order (higher = on top)
}

export type TemplateContainerConfig =
  | TextTemplateContainer
  | ImageTemplateContainer
  | NonTextTemplateContainer;

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
  graphics?: GraphicElement[];
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

/**
 * Template wrapper with metadata
 */
export interface Template {
  id: string;
  name: string;
  config: PartialTemplateConfig;
  graphics?: GraphicElement[]; // Optional decorative graphics
}
