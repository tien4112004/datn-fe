export enum ExamplePromptType {
  MINDMAP = 'MINDMAP',
  IMAGE = 'IMAGE',
  PRESENTATION = 'PRESENTATION',
  TEXT = 'TEXT',
}

export interface ExamplePromptContent {
  id: string;
  prompt: string;
  type: ExamplePromptType;
  icon?: string;
  data?: Record<string, any>;
}
