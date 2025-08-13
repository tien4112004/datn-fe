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

export interface OutlinePromptRequest {
  topic: string;
  slideCount: number;
  language: string;
  model: string;
  targetAge: string;
  learningObjective: string;
}
