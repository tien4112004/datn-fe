import type { SlideTheme, ModelConfig } from '@aiprimary/core';
import type { ImageGenerationParams } from '../image/types';

export type ArtStyle =
  | ''
  | 'photorealistic'
  | 'digital-art'
  | 'oil-painting'
  | 'watercolor'
  | 'anime'
  | 'cartoon'
  | 'sketch'
  | 'abstract'
  | 'surreal'
  | 'minimalist';

export interface PresentationConfig {
  theme: SlideTheme;
  viewport: {
    width: number;
    height: number;
  };
}

export interface PresentationGenerationRequest {
  presentationId: string;
  outline: string;
  model: ModelConfig;
  slideCount: number;
  language: string;
  presentation: PresentationConfig;
  generationOptions?: Omit<ImageGenerationParams, 'prompt' | 'slideId'>;
}

export interface PresentationGenerationStartResponse {
  presentationId: string;
  error?: unknown;
}

// Sharing types
export interface SharedUserApiResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  permission: 'read' | 'comment';
}

export interface SearchUserApiResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface SharePresentationRequest {
  targetUserIds: string[];
  permission: 'read' | 'comment';
}

export interface RevokeAccessRequest {
  targetUserId: string;
}

// Public access types
export interface PublicAccessRequest {
  isPublic: boolean;
  publicPermission: 'read' | 'comment';
}

export interface PublicAccessResponse {
  documentId: string;
  isPublic: boolean;
  publicPermission: 'read' | 'comment';
  // Note: shareLink removed - frontend constructs it locally
}

// Resource permission types
export interface ResourcePermissionResponse {
  resourceId: string;
  userId: string;
  permissions: string[]; // e.g., ['read', 'comment', 'edit']
  hasAccess: boolean;
}

/**
 * Combined response for ShareMenu initialization
 * Returns all data needed to render the share UI in a single API call
 * Optimized to reduce network round-trips from 2 to 1
 */
export interface ShareStateResponse {
  sharedUsers: SharedUserApiResponse[];
  publicAccess: PublicAccessResponse;
  currentUserPermission: 'read' | 'comment' | 'edit';
}
