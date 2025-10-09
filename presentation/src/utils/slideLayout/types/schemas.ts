export interface TwoColumnWithImageLayoutSchema {
  type: string;
  title: string;
  data: {
    image: string;
    items: string[];
  };
}

export interface MainImageLayoutSchema {
  type: string;
  data: {
    image: string;
    content: string;
  };
}

export interface TitleLayoutSchema {
  type: string;
  data: {
    title: string;
    subtitle?: string;
  };
}

export interface TwoColumnLayoutSchema {
  type: string;
  title: string;
  data: {
    items1: string[];
    items2: string[];
  };
}

export interface VerticalListLayoutSchema {
  type: string;
  title: string;
  data: {
    items: string[];
  };
}

export interface HorizontalListLayoutSchema {
  type: string;
  title: string;
  data: {
    items: {
      label: string;
      content: string;
    }[];
  };
}

export interface TransitionLayoutSchema {
  type: string;
  data: {
    title: string;
    subtitle: string;
  };
}

export interface TableOfContentsLayoutSchema {
  type: string;
  data: {
    items: string[];
  };
}

export const SLIDE_LAYOUT_TYPE = {
  TWO_COLUMN_WITH_IMAGE: 'two_column_with_image',
  MAIN_IMAGE: 'main_image',
  TITLE: 'title',
  TWO_COLUMN: 'two_column',
  VERTICAL_LIST: 'vertical_list',
  HORIZONTAL_LIST: 'horizontal_list',
  TRANSITION: 'transition',
  TABLE_OF_CONTENTS: 'table_of_contents',
} as const;

export { SLIDE_LAYOUT_TYPE as default };

export type SlideLayoutTypeKey = (typeof SLIDE_LAYOUT_TYPE)[keyof typeof SLIDE_LAYOUT_TYPE];

export type SlideLayoutSchema =
  | TwoColumnWithImageLayoutSchema
  | MainImageLayoutSchema
  | TitleLayoutSchema
  | TwoColumnLayoutSchema
  | VerticalListLayoutSchema
  | HorizontalListLayoutSchema
  | TransitionLayoutSchema
  | TableOfContentsLayoutSchema;
