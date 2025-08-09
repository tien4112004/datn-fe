export type MindMapTypes = 'mindMapNode' | 'mindmapEdge';

export const MINDMAP_TYPES = {
  MINDMAP_NODE: 'mindMapNode',
  MINDMAP_EDGE: 'mindmapEdge',
} as const;

export const DragHandle = {
  CLASS: 'dragHandle',
  SELECTOR: '.dragHandle',
};

export type Direction = 'horizontal' | 'vertical' | '';

export const DIRECTION = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  NONE: '',
} as const;
