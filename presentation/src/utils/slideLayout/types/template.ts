import type { SlideTheme } from '@/types/slides';
import type { Bounds, SlideViewport } from './base';
import type { BoundsExpression } from './expressions';
import type {
  RelativePositioning,
  TextLayoutBlockConfig,
  ImageLayoutBlockConfig,
  NonTextLayoutBlockConfig,
} from './layout-config';
import type { SlideLayoutBlockInstance } from './layout-instance';

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
