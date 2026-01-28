export type LinkedResourceType = 'mindmap' | 'presentation' | 'assignment';

export type PermissionLevel = 'view' | 'comment';

export interface LinkedResource {
  id: string;
  type: LinkedResourceType;
  title: string;
  thumbnail?: string;
  permissionLevel?: PermissionLevel;
}

/**
 * Request format for linked resources sent to the backend
 */
export interface LinkedResourceRequest {
  type: LinkedResourceType;
  id: string;
  permissionLevel?: PermissionLevel;
}

/**
 * Response format for linked resources from the backend
 */
export interface LinkedResourceResponse {
  type: LinkedResourceType;
  id: string;
  permissionLevel: PermissionLevel;
  title?: string; // Enriched by backend (optional for backward compatibility)
  thumbnail?: string; // Enriched by backend (optional, null for assignments)
}

/**
 * Groups linked resources by their type
 */
export function groupLinkedResourcesByType(
  resources: LinkedResourceRequest[]
): Record<LinkedResourceType, string[]> {
  const grouped: Record<LinkedResourceType, string[]> = {
    mindmap: [],
    presentation: [],
    assignment: [],
  };

  for (const resource of resources) {
    grouped[resource.type].push(resource.id);
  }

  return grouped;
}

// Legacy functions - kept for backward compatibility during migration
/**
 * @deprecated Use LinkedResourceRequest directly instead
 * Creates a composite ID in the format `{type}:{id}`
 */
export function createCompositeId(type: LinkedResourceType, id: string): string {
  return `${type}:${id}`;
}

/**
 * @deprecated Use LinkedResourceResponse directly instead
 * Parses a composite ID to extract type and id
 */
export function parseCompositeId(compositeId: string): { type: LinkedResourceType; id: string } | null {
  const separatorIndex = compositeId.indexOf(':');
  if (separatorIndex === -1) {
    return null;
  }

  const type = compositeId.substring(0, separatorIndex) as LinkedResourceType;
  const id = compositeId.substring(separatorIndex + 1);

  if (!isValidResourceType(type) || !id) {
    return null;
  }

  return { type, id };
}

function isValidResourceType(type: string): type is LinkedResourceType {
  return type === 'mindmap' || type === 'presentation' || type === 'assignment';
}

/**
 * @deprecated Use groupLinkedResourcesByType instead
 * Groups composite IDs by their resource type
 */
export function groupCompositeIdsByType(compositeIds: string[]): Record<LinkedResourceType, string[]> {
  const grouped: Record<LinkedResourceType, string[]> = {
    mindmap: [],
    presentation: [],
    assignment: [],
  };

  for (const compositeId of compositeIds) {
    const parsed = parseCompositeId(compositeId);
    if (parsed) {
      grouped[parsed.type].push(parsed.id);
    }
  }

  return grouped;
}
