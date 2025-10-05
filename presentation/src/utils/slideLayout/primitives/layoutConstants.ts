/**
 * Default slide dimensions (16:9 aspect ratio)
 */
export const SLIDE_WIDTH = 1000;
export const SLIDE_HEIGHT = 562.5;

/**
 * Default font sizing options
 */
export const DEFAULT_MIN_FONT_SIZE = 8;
export const DEFAULT_LABEL_TO_VALUE_RATIO = 1.2;

/**
 * Default spacing values
 */
export const DEFAULT_SPACING_BETWEEN_ITEMS = 10;
export const DEFAULT_LINE_SPACING = 0;

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
 * Default convergence options for font sizing
 */
export const DEFAULT_CONVERGENCE_OPTIONS = {
  minFontSize: DEFAULT_MIN_FONT_SIZE,
  labelToValueRatio: DEFAULT_LABEL_TO_VALUE_RATIO,
};

/**
 * Default padding configuration
 */
export const DEFAULT_PADDING = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

/**
 * Default text style configuration
 */
export const DEFAULT_TEXT_STYLE = {
  fontFamily: 'Arial',
  color: '#000000',
  fontWeight: 'normal' as const,
  textAlign: 'left' as const,
};

/**
 * Default border configuration
 */
export const DEFAULT_BORDER = {
  width: 0,
  color: '#000000',
  radius: 0,
};
