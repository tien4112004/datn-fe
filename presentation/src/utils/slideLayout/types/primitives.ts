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
