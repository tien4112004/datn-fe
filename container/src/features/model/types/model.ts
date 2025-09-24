export interface Model {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  default: boolean;
  provider: string;
  type: ModelType;
}

export const MODEL_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
} as const;
export type ModelType = (typeof MODEL_TYPES)[keyof typeof MODEL_TYPES];
