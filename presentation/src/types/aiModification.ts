import type { Component } from 'vue';

// Context types
export type AIContextType = 'slide' | 'element' | 'elements' | 'generate';
export type ElementType = 'text' | 'image' | 'shape' | 'chart' | 'table' | 'video' | 'audio' | 'latex';

// Action categories
export type AIActionCategory = 'text' | 'design' | 'generate';

// Parameter types
export type AIParameterType = 'select' | 'slider' | 'radio' | 'number' | 'text' | 'textarea';

export interface AIContext {
  type: AIContextType;
  elementTypes?: ElementType[];
}

export interface AIParameterOption {
  label: string;
  value: string | number;
  description?: string;
}

export interface AIParameter {
  id: string;
  name: string;
  type: AIParameterType;
  defaultValue: string | number;
  options?: AIParameterOption[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  placeholder?: string;
  description?: string;
}

export interface AIAction {
  id: string;
  name: string;
  description: string;
  category: AIActionCategory;
  contexts: AIContext[];
  parameters: AIParameter[];
  icon: Component;
}

export interface AIModificationState {
  selectedAction: AIAction | null;
  parameterValues: Record<string, string | number>;
  isProcessing: boolean;
  previewData: unknown;
  error: string | null;
}

export interface CurrentContext {
  type: AIContextType;
  elementType?: ElementType;
  elementTypes?: ElementType[];
  count?: number;
  data: unknown;
}

// API Request/Response types
export interface AIModificationRequest {
  action: string;
  context: {
    type: AIContextType;
    slideId?: string;
    elementId?: string | string[];
    slideContent?: unknown;
    elementContent?: unknown;
  };
  parameters: Record<string, string | number>;
}

export interface AIModificationResponse {
  success: boolean;
  data: {
    modifiedContent?: unknown;
    newSlides?: unknown[];
    suggestions?: unknown[];
  };
  error?: string;
}
