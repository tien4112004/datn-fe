export interface TwoColumnWithImageLayoutSchema {
  type: string;
  title: string;
  data: {
    image: string;
    items: string[];
    prompt?: string;
  };
}

export interface MainImageLayoutSchema {
  type: string;
  data: {
    image: string;
    content: string;
    prompt?: string;
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

export interface TimelineLayoutSchema {
  type: string;
  title: string;
  data: {
    items: {
      label: string;
      content: string;
    }[];
  };
}

export interface PyramidLayoutSchema {
  type: string;
  title: string;
  data: {
    items: string[];
  };
}

export type SlideLayoutSchema =
  | TwoColumnWithImageLayoutSchema
  | MainImageLayoutSchema
  | TitleLayoutSchema
  | TwoColumnLayoutSchema
  | ListLayoutSchema
  | LabeledListLayoutSchema
  | TableOfContentsLayoutSchema
  | TimelineLayoutSchema
  | PyramidLayoutSchema;
