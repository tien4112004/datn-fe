export const EXAMPLE_PROMPT_TYPE = {
  MINDMAP: 'MINDMAP',
  IMAGE: 'IMAGE',
  PRESENTATION: 'PRESENTATION',
  TEXT: 'TEXT',
} as const;

export type ExamplePromptType = (typeof EXAMPLE_PROMPT_TYPE)[keyof typeof EXAMPLE_PROMPT_TYPE];

export interface ExamplePromptContent {
  id: string;
  prompt: string;
  type: ExamplePromptType;
  icon?: string;
  data?: Record<string, any>;
}
