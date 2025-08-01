export type OutlineItem = {
  id: string;
  htmlContent: string;
};

export type OutlineData = {
  prompt: string;
  slideCount: string | undefined;
  style: string | undefined;
  model: string;
};