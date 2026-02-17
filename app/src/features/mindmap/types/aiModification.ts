import type { MindMapNode } from './mindmap';

export type AIPanelContextType = 'no-selection' | 'single-node' | 'same-branch' | 'cross-branch';

// Tree context for API requests
export interface TreeContext {
  mindmapId?: string;
  rootNodeId?: string;
  currentLevel?: number;
  parentContent?: string;
  siblingContents?: string[];
  // Enhanced context for better AI responses
  mindmapTitle?: string;
  rootNodeContent?: string;
  fullAncestryPath?: string[]; // Ordered from root to immediate parent
}

// API Request types
export interface RefineNodeContentRequest {
  nodeId: string;
  currentContent: string;
  instruction: string;
  operation?: string;
  context?: TreeContext;
  model?: string;
  provider?: string;
}

export interface ExpandNodeRequest {
  nodeId: string;
  nodeContent: string;
  maxChildren?: number;
  maxDepth?: number;
  language?: string;
  grade?: string;
  subject?: string;
  model?: string;
  provider?: string;
}

export interface NodeContentItem {
  nodeId: string;
  content: string;
  level: number;
}

export interface RefineBranchRequest {
  nodes: NodeContentItem[];
  instruction: string;
  operation?: string;
  context?: TreeContext;
  model?: string;
  provider?: string;
}

// API Response types
export interface AIModificationResponse {
  success: boolean;
  data: any;
  message?: string;
}

export interface SingleNodeContext {
  type: 'single-node';
  node: MindMapNode;
  parentContent?: string;
  siblingContents: string[];
  ancestryPath: string[]; // Full path from root to immediate parent
  level: number;
}

export interface SameBranchContext {
  type: 'same-branch';
  nodes: MindMapNode[];
  parentContent?: string;
  ancestryPath: string[]; // Full path from root to parent
  level: number;
  nodeCount: number;
}

export interface CrossBranchContext {
  type: 'cross-branch';
  nodeCount: number;
}

export interface NoSelectionContext {
  type: 'no-selection';
}

export type AIPanelContext = SingleNodeContext | SameBranchContext | CrossBranchContext | NoSelectionContext;

export interface QuickAction {
  icon: string;
  label: string;
  operation: 'expand' | 'shorten' | 'grammar' | 'formal' | 'expand-tree';
  instruction: string;
  tooltip?: string;
}
