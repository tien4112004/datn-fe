import type { SlideViewport, SlideTheme } from '../slide';
import type { BoundsExpression } from './expressions';
import type { GraphicElement } from './graphics';
import type {
  ImageLayoutBlockConfig,
  NonTextLayoutBlockConfig,
  RelativePositioning,
  SlideLayoutBlockInstance,
  TextLayoutBlockConfig,
} from './layout';

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
  graphics?: GraphicElement[];
  parameters?: TemplateParameter[]; // Template parameters for user customization
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
 * Template parameter definition for user customization
 * Supports both number and boolean types
 */
export type TemplateParameter = NumberParameter | BooleanParameter;

/**
 * Numeric parameter with min/max/step controls
 */
export interface NumberParameter {
  type?: 'number'; // Type discriminator (optional for backward compatibility)
  key: string; // Variable name used in expressions (e.g., "IMAGE_RATIO")
  label: string; // User-friendly name for UI
  defaultValue: number; // Default value if not overridden
  min?: number; // Minimum allowed value
  max?: number; // Maximum allowed value
  step?: number; // Step increment for UI controls
  description?: string; // Help text for users
}

/**
 * Boolean parameter with checkbox/toggle control
 */
export interface BooleanParameter {
  type: 'boolean'; // Type discriminator (required)
  key: string; // Variable name used in expressions (e.g., "SHOW_ICONS")
  label: string; // User-friendly name for UI
  defaultValue: boolean; // Default value if not overridden
  description?: string; // Help text for users
}

/**
 * Template wrapper with metadata
 */
export interface Template extends PartialTemplateConfig {
  id: string;
  name: string;
}
