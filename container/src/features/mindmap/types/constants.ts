export const DragHandle = {
  CLASS: 'dragHandle',
  SELECTOR: '.dragHandle',
};

export const DIRECTION = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  NONE: '',
} as const;

export type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];

export const SIDE = {
  LEFT: 'left',
  RIGHT: 'right',
  MID: 'mid',
} as const;

export type Side = (typeof SIDE)[keyof typeof SIDE];

export const SHAPES = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  ELLIPSE: 'ellipse',
} as const;

export type Shape = (typeof SHAPES)[keyof typeof SHAPES];

export const MINDMAP_TYPES = {
  TEXT_NODE: 'mindmapTextNode',
  ROOT_NODE: 'mindmapRootNode',
  EDGE: 'mindmapEdge',
  SHAPE_NODE: 'mindmapShapeNode',
  IMAGE_NODE: 'mindmapImageNode',
} as const;

export const SMOOTH_TYPES = {
  SMOOTHSTEP: 'smoothstep',
  STRAIGHT: 'straight',
  BEZIER: 'bezier',
} as const;
