export const DRAGHANDLE = {
  CLASS: 'dragHandle',
  SELECTOR: '.dragHandle',
};

/**
 * @deprecated Use LAYOUT_TYPE instead. DIRECTION will be removed in a future version.
 */
export const DIRECTION = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  NONE: '',
} as const;

/**
 * Layout types for mindmap node arrangement.
 * These define how nodes are positioned relative to their parent.
 */
export const LAYOUT_TYPE = {
  /** Children extend left and right from parent (balanced horizontal tree) */
  HORIZONTAL_BALANCED: 'horizontal-balanced',
  /** Children extend up and down from parent (balanced vertical tree) */
  VERTICAL_BALANCED: 'vertical-balanced',
  /** All children extend to the right of parent (classic tree view) */
  RIGHT_ONLY: 'right-only',
  /** All children extend to the left of parent (classic tree view mirrored) */
  LEFT_ONLY: 'left-only',
  /** Children positioned below parent, centered horizontally */
  BOTTOM_ONLY: 'bottom-only',
  /** Children positioned above parent, centered horizontally */
  TOP_ONLY: 'top-only',
  /** No automatic layout */
  NONE: '',
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
