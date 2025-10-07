// ============================================================================
// Base Types
// ============================================================================

export interface SlideViewport {
  width: number;
  height: number;
}

export interface Position {
  left: number;
  top: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Position, Size {}

export type DistributionType = 'equal' | 'space-between' | 'space-around';
