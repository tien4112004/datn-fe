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

export interface ListLayoutSchema {
  type: string;
  title: string;
  data: {
    items: string[];
  };
}

export interface LabeledListLayoutSchema {
  type: string;
  title: string;
  data: {
    items: {
      label: string;
      content: string;
    }[];
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
  LIST: 'vertical_list',
  LABELED_LIST: 'horizontal_list',
  TABLE_OF_CONTENTS: 'table_of_contents',
} as const;

export { SLIDE_LAYOUT_TYPE as default };

export type SlideLayoutTypeKey = (typeof SLIDE_LAYOUT_TYPE)[keyof typeof SLIDE_LAYOUT_TYPE];

export type SlideLayoutSchema =
  | TwoColumnWithImageLayoutSchema
  | MainImageLayoutSchema
  | TitleLayoutSchema
  | TwoColumnLayoutSchema
  | ListLayoutSchema
  | LabeledListLayoutSchema
  | TableOfContentsLayoutSchema;
