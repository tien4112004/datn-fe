export type MindMapTypes = 'mindMapNode' | 'mindMapRootNode' | 'mindmapEdge';

export const MINDMAP_TYPES = {
  MINDMAP_NODE: 'mindMapNode',
  MINDMAP_ROOT_NODE: 'mindMapRootNode',
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
