/**
 * Types for Node Expansion feature
 */

export interface ExpandNodeFormData {
  maxChildren: number;
  maxDepth: number;
  language: string;
  grade?: string;
  subject?: string;
  model: {
    name: string;
    provider: string;
  };
}

export const EXPAND_MAX_CHILDREN_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const EXPAND_MAX_DEPTH_OPTIONS = [1, 2, 3, 4, 5] as const;
export const EXPAND_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' },
] as const;

export interface ExpandNodeParams {
  nodeId: string;
  nodeContent: string;
  maxChildren: number;
  maxDepth: number;
  language: string;
  grade?: string;
  subject?: string;
  model: string;
  provider: string;
}
