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
  SHAPE_NODE: 'mindmapShapeNode',
  IMAGE_NODE: 'mindmapImageNode',
} as const;

export const PATH_TYPES = {
  SMOOTHSTEP: 'smoothstep',
  STRAIGHT: 'straight',
  BEZIER: 'bezier',
} as const;

export const EDGE_COLORS = {
  PRIMARY: 'var(--primary)',
  BLUE: '#3b82f6',
  GREEN: '#10b981',
  PURPLE: '#8b5cf6',
  ORANGE: '#f59e0b',
  RED: '#ef4444',
} as const;
