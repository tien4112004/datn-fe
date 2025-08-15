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
