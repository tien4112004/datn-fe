export type OutlineItem = {
  id: string;
  markdownContent: string;
};

export type OutlineData = {
  topic: string;
  slideCount: number;
  language: string;
  model: {
    name: string;
    provider: string;
  };
};
