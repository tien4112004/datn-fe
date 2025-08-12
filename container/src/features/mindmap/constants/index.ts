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
