/**
 * Types for shared resources feature
 */

export type ResourceType = 'mindmap' | 'presentation';
export type PermissionType = 'read' | 'comment' | 'edit';

export interface SharedResource {
  id: string;
  type: ResourceType;
  title: string;
  permission: PermissionType;
  ownerId: string;
  ownerName: string;
  thumbnailUrl?: string;
}

export interface SharedResourcesResponse {
  data: SharedResource[];
  message: string;
}
