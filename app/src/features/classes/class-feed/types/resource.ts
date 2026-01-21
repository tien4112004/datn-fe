export type LinkedResourceType = 'mindmap' | 'presentation' | 'assignment';

export interface LinkedResource {
  id: string;
  type: LinkedResourceType;
  title: string;
  thumbnail?: string;
}

/**
 * Creates a composite ID in the format `{type}:{id}`
 * Used to store resource type info within the linkedResourceIds array
 */
export function createCompositeId(type: LinkedResourceType, id: string): string {
  return `${type}:${id}`;
}

/**
 * Parses a composite ID to extract type and id
 * Returns null if the format is invalid
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
