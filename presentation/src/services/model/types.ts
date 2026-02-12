/**
 * Model service types
 * Types for AI model configuration and management
 */

export type ModelType = 'TEXT' | 'IMAGE';

export interface ModelInfo {
  name: string;
  provider: string;
  displayName?: string;
}

export interface ModelApiResponse {
  modelName: string;
  provider: string;
  displayName?: string;
  enabled: boolean;
  default: boolean;
}

export interface ModelListParams {
  modelType: ModelType;
}

export interface ModelListResponse {
  data: ModelApiResponse[];
}
