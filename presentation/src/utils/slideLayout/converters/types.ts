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
  data: {
    title: string;
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

// Layout Template System
export interface LayoutBlock {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface LayoutGraphics {
  titleLine?: {
    enabled: boolean;
    offset?: number;
    style?: 'solid' | 'dashed';
    color?: string;
    width?: number;
  };
}

export interface LayoutTemplate {
  id: string;
  name?: string;
  viewport: {
    size: number;
    ratio: number;
  };
  areas: Record<string, LayoutBlock>;
  graphics?: LayoutGraphics;
}
