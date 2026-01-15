// ============================================================================
// Layout Expression System
// ============================================================================

/**
 * Expression system allows templates to define layout calculations declaratively
 * instead of computing them imperatively in template getters.
 */

// Arithmetic expressions that can reference constants and other values
export type ArithmeticExpression = string; // e.g., "SLIDE_WIDTH * 0.6", "width * (2/3)"

// Keyword-based expressions for common patterns
export type KeywordExpression =
  | 'center' // Center in parent/slide
  | 'start' // Start (left/top) of parent/slide
  | 'end' // End (right/bottom) of parent/slide
  | 'fill' // Fill remaining space
  | 'after' // Position after another element
  | 'before'; // Position before another element

// Value can be a number, expression, or keyword
export type ExpressionValue = number | ArithmeticExpression | KeywordExpression;

// Dimension expression with optional constraints
export interface DimensionExpression {
  expr: ExpressionValue;
  min?: ExpressionValue;
  max?: ExpressionValue;
}

// Position expression with relative positioning
export interface PositionExpression {
  expr: ExpressionValue;
  relativeTo?: string; // Container ID to position relative to
  offset?: number; // Offset from the resolved position
}

// Layout bounds using expressions
export interface BoundsExpression {
  left?: number | PositionExpression;
  top?: number | PositionExpression;
  width?: number | DimensionExpression;
  height?: number | DimensionExpression;
}

// Constants available in expression context
export interface ExpressionConstants {
  SLIDE_WIDTH: number;
  SLIDE_HEIGHT: number;
  [key: string]: number | boolean; // Support both number and boolean parameters
}

// Resolved bounds after expression evaluation
export interface ResolvedBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

// Context for expression evaluation
export interface ExpressionContext {
  constants: ExpressionConstants;
  containers: Record<string, ResolvedBounds>; // Already resolved containers
  currentContainer?: string; // ID of the container being resolved
}

// Expression evaluation result
export interface ExpressionResult {
  value: number;
  dependencies: string[]; // Container IDs this expression depends on
}
