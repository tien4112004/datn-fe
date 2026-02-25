import type { SlideLayoutSchema } from '@/utils/slideLayout/types';
import { SLIDE_LAYOUT_TYPE } from '@/utils/slideLayout/types';

export interface LayoutPreset {
  id: string;
  nameKey: string;
  layoutType: string;
  preferredTemplateId: string;
  schema: SlideLayoutSchema;
}

const LIST_TEMPLATE_ID = 'list-flexible';
const LABELED_LIST_TEMPLATE_ID = 'labeled-list-flexible';

export const LAYOUT_PRESETS: LayoutPreset[] = [
  // Title
  {
    id: 'title',
    nameKey: 'layoutPresets.title',
    layoutType: SLIDE_LAYOUT_TYPE.TITLE,
    preferredTemplateId: 'title-default',
    schema: {
      type: 'title',
      data: {
        title: 'Click to add title',
        subtitle: 'Click to add subtitle',
      },
    },
  },

  // List (2–6 items)
  {
    id: 'list-2',
    nameKey: 'layoutPresets.list-2',
    layoutType: SLIDE_LAYOUT_TYPE.LIST,
    preferredTemplateId: LIST_TEMPLATE_ID,
    schema: {
      type: 'list',
      title: 'Slide Title',
      data: { items: ['First item', 'Second item'] },
    },
  },
  {
    id: 'list-3',
    nameKey: 'layoutPresets.list-3',
    layoutType: SLIDE_LAYOUT_TYPE.LIST,
    preferredTemplateId: LIST_TEMPLATE_ID,
    schema: {
      type: 'list',
      title: 'Slide Title',
      data: { items: ['First item', 'Second item', 'Third item'] },
    },
  },
  {
    id: 'list-4',
    nameKey: 'layoutPresets.list-4',
    layoutType: SLIDE_LAYOUT_TYPE.LIST,
    preferredTemplateId: LIST_TEMPLATE_ID,
    schema: {
      type: 'list',
      title: 'Slide Title',
      data: { items: ['First item', 'Second item', 'Third item', 'Fourth item'] },
    },
  },
  {
    id: 'list-5',
    nameKey: 'layoutPresets.list-5',
    layoutType: SLIDE_LAYOUT_TYPE.LIST,
    preferredTemplateId: LIST_TEMPLATE_ID,
    schema: {
      type: 'list',
      title: 'Slide Title',
      data: { items: ['First item', 'Second item', 'Third item', 'Fourth item', 'Fifth item'] },
    },
  },
  {
    id: 'list-6',
    nameKey: 'layoutPresets.list-6',
    layoutType: SLIDE_LAYOUT_TYPE.LIST,
    preferredTemplateId: LIST_TEMPLATE_ID,
    schema: {
      type: 'list',
      title: 'Slide Title',
      data: { items: ['First item', 'Second item', 'Third item', 'Fourth item', 'Fifth item', 'Sixth item'] },
    },
  },

  // Labeled list (2–4 items)
  {
    id: 'labeled-list-2',
    nameKey: 'layoutPresets.labeled-list-2',
    layoutType: SLIDE_LAYOUT_TYPE.LABELED_LIST,
    preferredTemplateId: LABELED_LIST_TEMPLATE_ID,
    schema: {
      type: 'labeled_list',
      title: 'Slide Title',
      data: {
        items: [
          { label: 'Label 1', content: 'Description for the first item' },
          { label: 'Label 2', content: 'Description for the second item' },
        ],
      },
    },
  },
  {
    id: 'labeled-list-3',
    nameKey: 'layoutPresets.labeled-list-3',
    layoutType: SLIDE_LAYOUT_TYPE.LABELED_LIST,
    preferredTemplateId: LABELED_LIST_TEMPLATE_ID,
    schema: {
      type: 'labeled_list',
      title: 'Slide Title',
      data: {
        items: [
          { label: 'Label 1', content: 'Description for the first item' },
          { label: 'Label 2', content: 'Description for the second item' },
          { label: 'Label 3', content: 'Description for the third item' },
        ],
      },
    },
  },
  {
    id: 'labeled-list-4',
    nameKey: 'layoutPresets.labeled-list-4',
    layoutType: SLIDE_LAYOUT_TYPE.LABELED_LIST,
    preferredTemplateId: LABELED_LIST_TEMPLATE_ID,
    schema: {
      type: 'labeled_list',
      title: 'Slide Title',
      data: {
        items: [
          { label: 'Label 1', content: 'Description for the first item' },
          { label: 'Label 2', content: 'Description for the second item' },
          { label: 'Label 3', content: 'Description for the third item' },
          { label: 'Label 4', content: 'Description for the fourth item' },
        ],
      },
    },
  },

  // Two column
  {
    id: 'two-column',
    nameKey: 'layoutPresets.two-column',
    layoutType: SLIDE_LAYOUT_TYPE.TWO_COLUMN,
    preferredTemplateId: 'two-column-compact',
    schema: {
      type: 'two_column',
      title: 'Slide Title',
      data: {
        items1: ['Left item 1', 'Left item 2', 'Left item 3'],
        items2: ['Right item 1', 'Right item 2', 'Right item 3'],
      },
    },
  },

  // Two column with image
  {
    id: 'two-column-image',
    nameKey: 'layoutPresets.two-column-image',
    layoutType: SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_IMAGE,
    preferredTemplateId: 'two-column-with-image',
    schema: {
      type: 'two_column_with_image',
      title: 'Slide Title',
      data: {
        items: ['First feature', 'Second feature', 'Third feature'],
        image: 'https://placehold.co/400x300',
      },
    },
  },

  // Timeline
  {
    id: 'timeline-4',
    nameKey: 'layoutPresets.timeline-4',
    layoutType: SLIDE_LAYOUT_TYPE.TIMELINE,
    preferredTemplateId: 'timeline-straight',
    schema: {
      type: 'timeline',
      title: 'Timeline',
      data: {
        items: [
          { label: 'Step 1', content: 'First milestone' },
          { label: 'Step 2', content: 'Second milestone' },
          { label: 'Step 3', content: 'Third milestone' },
          { label: 'Step 4', content: 'Fourth milestone' },
        ],
      },
    },
  },

  // Table of contents
  {
    id: 'table-of-contents',
    nameKey: 'layoutPresets.table-of-contents',
    layoutType: SLIDE_LAYOUT_TYPE.TABLE_OF_CONTENTS,
    preferredTemplateId: 'table-of-contents-two-column',
    schema: {
      type: 'table_of_contents',
      data: {
        items: ['Introduction', 'Main Concepts', 'Implementation', 'Results', 'Conclusion'],
      },
    },
  },
];
