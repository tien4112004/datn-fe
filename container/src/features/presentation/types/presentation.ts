import type { Slide, SlideTheme } from './slide';

export interface Presentation {
  id: string;
  title: string;
  width?: number;
  height?: number;
  theme?: SlideTheme;
  thumbnail?: Slide;
  slides?: Slide[];
  isParsed?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface PresentationCollectionRequest {
  page?: number;
  pageSize?: number;
  filter?: string;
  sortBy?: 'createdAt'; // API only supports sorting by createdAt for now
  sort?: 'asc' | 'desc';
}

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

export type SlideLayoutSchema =
  | TwoColumnWithImageLayoutSchema
  | MainImageLayoutSchema
  | TitleLayoutSchema
  | TwoColumnLayoutSchema
  | VerticalListLayoutSchema
  | HorizontalListLayoutSchema
  | TransitionLayoutSchema
  | TableOfContentsLayoutSchema;

export interface AiResultSlide {
  result: SlideLayoutSchema;
  order: number;
  theme: SlideTheme;
}
