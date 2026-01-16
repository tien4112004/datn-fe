// Model interface - represents AI models (TEXT or IMAGE generation)
export interface Model {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  default: boolean;
  provider: string;
  type: ModelType;
}

// Model type enum
export const MODEL_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
} as const;

export type ModelType = (typeof MODEL_TYPES)[keyof typeof MODEL_TYPES];

// Model patch data for updates
export interface ModelPatchData {
  isEnabled?: boolean;
  isDefault?: boolean;
}
