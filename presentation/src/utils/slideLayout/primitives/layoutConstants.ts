/**
 * Default slide dimensions (16:9 aspect ratio)
 */
export const SLIDE_WIDTH = 1000;
export const SLIDE_HEIGHT = 562.5;
export const DEFAULT_VIEWPORT = { width: SLIDE_WIDTH, height: SLIDE_HEIGHT };

/**
 * Default font sizing options
 */
export const DEFAULT_MIN_FONT_SIZE = 8;
export const DEFAULT_LABEL_TO_VALUE_RATIO = 1.1;

/**
 * Default spacing values
 */
export const DEFAULT_SPACING_BETWEEN_ITEMS = 10;
export const DEFAULT_LINE_SPACING = 0;
export const DEFAULT_TITLE_LINE_SPACING = 10;

/**
 * Default border radius multiplier for rounded rectangles
 */
export const DEFAULT_RADIUS_MULTIPLIER = 0.125;

/**
 * Default wrap configuration
 */
export const DEFAULT_WRAP_CONFIG = {
  enabled: true,
  maxItemsPerLine: 50, // Effectively infinite for non-wrap
};

/**
 * Font size ranges for different label types
 */
export const FONT_SIZE_RANGE_LABEL = { minSize: 18, maxSize: 24 };
export const FONT_SIZE_RANGE_CONTENT = { minSize: 16, maxSize: 22 };
export const FONT_SIZE_RANGE_TITLE = { minSize: 28, maxSize: 48 };
