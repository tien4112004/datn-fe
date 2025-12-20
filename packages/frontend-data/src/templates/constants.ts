/**
 * Layout type constants for slide templates
 */

/**
 * Available layout types (snake_case - used everywhere)
 */
export const LAYOUT_TYPES = [
  'title',
  'list',
  'labeled_list',
  'two_column',
  'two_column_with_image',
  'main_image',
  'table_of_contents',
  'timeline',
  'pyramid',
] as const;

/**
 * Layout type union from the available layouts
 */
export type LayoutType = (typeof LAYOUT_TYPES)[number];
