export const DRAGHANDLE = {
  CLASS: 'dragHandle',
  SELECTOR: '.dragHandle',
  NODRAG_CLASS: 'nodrag',
};

/**
 * Layout types for mindmap node arrangement.
 * These define how nodes are positioned relative to their parent.
 */
export const LAYOUT_TYPE = {
  HORIZONTAL_BALANCED: 'horizontal-balanced',
  VERTICAL_BALANCED: 'vertical-balanced',
  RIGHT_ONLY: 'right-only',
  LEFT_ONLY: 'left-only',
  BOTTOM_ONLY: 'bottom-only',
  TOP_ONLY: 'top-only',
} as const;

export const SIDE = {
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom',
  MID: 'mid',
} as const;

export const SHAPES = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  ELLIPSE: 'ellipse',
} as const;

export const MINDMAP_TYPES = {
  TEXT_NODE: 'mindmapTextNode',
  ROOT_NODE: 'mindmapRootNode',
  EDGE: 'mindmapEdge',
  /** @deprecated SHAPE_NODE is deprecated and will be removed in a future version. */
  SHAPE_NODE: 'mindmapShapeNode',
  /** @deprecated IMAGE_NODE is deprecated and will be removed in a future version. */
  IMAGE_NODE: 'mindmapImageNode',
} as const;

export const PATH_TYPES = {
  SMOOTHSTEP: 'smoothstep',
  STRAIGHT: 'straight',
  BEZIER: 'bezier',
} as const;

export const POSITION = {
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom',
} as const;
