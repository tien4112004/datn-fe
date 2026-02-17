/**
 * Types for Node Expansion feature
 */

import type { TreeContext } from './aiModification';

export interface ExpandNodeFormData {
  maxChildren: number;
  maxDepth: number;
  model: {
    name: string;
    provider: string;
  };
}

export const EXPAND_MAX_CHILDREN_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const EXPAND_MAX_DEPTH_OPTIONS = [1, 2, 3, 4, 5] as const;

export interface ExpandNodeParams {
  nodeId: string;
  nodeContent: string;
  maxChildren: number;
  maxDepth: number;
  context?: TreeContext;
  model: string;
  provider: string;
}
