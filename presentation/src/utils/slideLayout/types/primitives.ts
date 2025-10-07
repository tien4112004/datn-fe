// ============================================================================
// Primitive Calculation Types
// ============================================================================

/**
 * Unified Font Sizing Types
 */
export interface ConvergenceOptions {
  minFontSize?: number; // Default: 8
  labelToValueRatio?: number; // Default: 1.2 (label should be 1.2x bigger)
}

/**
 * Element Measurement Types
 */
export interface ElementMeasurementConstraints {
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Font Size Calculation Types
 */
export interface FontSizeCalculationResult {
  fontSize: number;
  lineHeight: number;
  spacing: number;
}

export interface FontSizeRange {
  minSize: number;
  maxSize: number;
}
