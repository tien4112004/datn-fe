/**
 * Resource types supported by the application
 */
export const RESOURCE_TYPES = {
  PRESENTATION: 'presentation',
  MINDMAP: 'mindmap',
  DOCUMENT: 'document',
  VIDEO: 'video',
  IMAGE: 'image',
} as const;

export type ResourceType = (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];

/**
 * Resource types that support creation functionality
 */
export const CREATABLE_RESOURCE_TYPES = [RESOURCE_TYPES.PRESENTATION, RESOURCE_TYPES.MINDMAP] as const;

export type CreatableResourceType = (typeof CREATABLE_RESOURCE_TYPES)[number];
