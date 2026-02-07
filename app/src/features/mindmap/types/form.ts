export interface CreateMindmapFormData {
  topic: string;
  model: {
    name: string;
    provider: string;
  };
  language: 'en' | 'vi';
  maxDepth: number;
  maxBranchesPerNode: number;
  grade?: string;
  subject?: string;
}

/**
 * Request data passed from Flutter to React via localStorage
 * for mobile mindmap generation flow.
 */
export interface MindmapMobileGenerationRequest {
  mindmapId: string;
  topic: string;
  model: string;
  provider: string;
  language: 'en' | 'vi';
  maxDepth: number;
  maxBranchesPerNode: number;
  grade?: string;
  subject?: string;
}

export const LANGUAGE_OPTIONS = [
  { value: 'en', labelKey: 'english' },
  { value: 'vi', labelKey: 'vietnamese' },
] as const;

export const MAX_DEPTH_OPTIONS = [1, 2, 3, 4, 5] as const;
export const MAX_BRANCHES_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
