import { useQuery } from '@tanstack/react-query';
import { useMindmapApiService } from '@/features/mindmap/api';
import { usePresentationApiService } from '@/features/presentation/api';
import { getAssignmentApiService } from '@/features/assignment/api';
import {
  groupLinkedResourcesByType,
  type LinkedResource,
  type LinkedResourceResponse,
} from '@/features/projects/types/resource';

interface UseLinkedResourcesOptions {
  linkedResources: LinkedResourceResponse[];
  enabled?: boolean;
}

export function useLinkedResources({ linkedResources, enabled = true }: UseLinkedResourcesOptions) {
  const mindmapApiService = useMindmapApiService();
  const presentationApiService = usePresentationApiService();

  // Check if all resources are already enriched (have title from backend)
  const allEnriched = linkedResources.length > 0 && linkedResources.every((r) => r.title);

  return useQuery({
    queryKey: ['linkedResources', linkedResources],
    queryFn: async (): Promise<LinkedResource[]> => {
      if (linkedResources.length === 0) {
        return [];
      }

      // If all resources are already enriched by the backend, use them directly
      if (allEnriched) {
        return linkedResources.map((r) => ({
          id: r.id,
          type: r.type,
          title: r.title!,
          thumbnail: r.thumbnail,
          permissionLevel: r.permissionLevel,
        }));
      }

      // Otherwise fall back to individual API calls (for backward compatibility)
      const grouped = groupLinkedResourcesByType(linkedResources);
      const results: LinkedResource[] = [];

      // Create a map to preserve permission levels
      const permissionMap = new Map(linkedResources.map((r) => [`${r.type}:${r.id}`, r.permissionLevel]));

      // Fetch mindmaps
      if (grouped.mindmap.length > 0) {
        try {
          const mindmapPromises = grouped.mindmap.map((id) =>
            mindmapApiService.getMindmapById(id).catch(() => null)
          );
          const mindmaps = await Promise.all(mindmapPromises);
          for (const mindmap of mindmaps) {
            if (mindmap) {
              results.push({
                id: mindmap.id,
                type: 'mindmap',
                title: mindmap.title,
                thumbnail: mindmap.thumbnail,
                permissionLevel: permissionMap.get(`mindmap:${mindmap.id}`),
              });
            }
          }
        } catch {
          // Ignore errors for individual mindmaps
        }
      }

      // Fetch presentations
      if (grouped.presentation.length > 0) {
        try {
          const presentationPromises = grouped.presentation.map((id) =>
            presentationApiService.getPresentationById(id).catch(() => null)
          );
          const presentations = await Promise.all(presentationPromises);
          for (const presentation of presentations) {
            if (presentation) {
              results.push({
                id: presentation.id,
                type: 'presentation',
                title: presentation.title,
                thumbnail: typeof presentation.thumbnail === 'string' ? presentation.thumbnail : undefined,
                permissionLevel: permissionMap.get(`presentation:${presentation.id}`),
              });
            }
          }
        } catch {
          // Ignore errors for individual presentations
        }
      }

      // Fetch assignments
      if (grouped.assignment.length > 0) {
        try {
          const assignmentService = getAssignmentApiService();
          const assignmentPromises = grouped.assignment.map((id) =>
            assignmentService.getAssignmentById(id).catch(() => null)
          );
          const assignments = await Promise.all(assignmentPromises);
          for (const assignment of assignments) {
            if (assignment) {
              results.push({
                id: assignment.id,
                type: 'assignment',
                title: assignment.title,
                permissionLevel: permissionMap.get(`assignment:${assignment.id}`),
              });
            }
          }
        } catch {
          // Ignore errors for individual assignments
        }
      }

      return results;
    },
    enabled: enabled && linkedResources.length > 0,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
}
