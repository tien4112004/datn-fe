export type OutlineItem = {
  id: string;
  markdownContent: string;
};

export type OutlineData = {
  topic?: string;
  fileUrls?: string[];
  slideCount: number;
  language: string;
  model: {
    name: string;
    provider: string;
  };
  grade?: string;
  subject?: string;
  chapter?: string;
};
