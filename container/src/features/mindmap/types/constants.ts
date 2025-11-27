export const DRAGHANDLE = {
  CLASS: 'dragHandle',
  SELECTOR: '.dragHandle',
};

export const DIRECTION = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  NONE: '',
} as const;

export const SIDE = {
  LEFT: 'left',
  RIGHT: 'right',
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
