export * from './expressions';
export * from './graphics';
export * from './layout';
export * from './styling';
export * from './template';

// Re-export SlideViewport and SlideTheme from parent module (slide.ts)
export type { SlideViewport, SlideTheme } from '../slide';

/**
 * Slide layout type enum-like object for accessing layout types
 * This is the single source of truth - other packages re-export from here
 */
export const SLIDE_LAYOUT_TYPE = {
  TITLE: 'title',
  LIST: 'list',
  LABELED_LIST: 'labeled_list',
  TWO_COLUMN: 'two_column',
  TWO_COLUMN_WITH_IMAGE: 'two_column_with_image',
  MAIN_IMAGE: 'main_image',
  TABLE_OF_CONTENTS: 'table_of_contents',
  TIMELINE: 'timeline',
  PYRAMID: 'pyramid',
} as const;

/**
 * Layout type union - single source of truth for layout types
 */
export type LayoutType = (typeof SLIDE_LAYOUT_TYPE)[keyof typeof SLIDE_LAYOUT_TYPE];
