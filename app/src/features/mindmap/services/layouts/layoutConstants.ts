/**
 * Layout spacing and sizing constants
 *
 * Centralized constants for layout calculations to avoid magic numbers
 * scattered throughout the codebase.
 */

/**
 * Default horizontal spacing between parent and child nodes
 * Used in horizontal layouts (left-only, right-only, horizontal-balanced)
 */
export const DEFAULT_HORIZONTAL_SPACING = 140;

/**
 * Default vertical spacing between sibling nodes
 * Used in horizontal layouts for spacing between siblings
 */
export const DEFAULT_VERTICAL_SPACING = 80;

/**
 * Default base radius from root to first level children in radial layouts
 */
export const DEFAULT_BASE_RADIUS = 200;

/**
 * Default additional radius increment per level in radial layouts
 */
export const DEFAULT_RADIUS_INCREMENT = 150;

/**
 * Spacing profiles for different layout densities
 */
export const SPACING_PROFILES = {
  COMPACT: {
    horizontal: 80,
    vertical: 60,
  },
  DEFAULT: {
    horizontal: DEFAULT_HORIZONTAL_SPACING,
    vertical: DEFAULT_VERTICAL_SPACING,
  },
  SPACIOUS: {
    horizontal: 180,
    vertical: 100,
  },
} as const;

/**
 * Type for spacing profile names
 */
export type SpacingProfileName = keyof typeof SPACING_PROFILES;
