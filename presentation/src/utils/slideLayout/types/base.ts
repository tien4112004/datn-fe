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
