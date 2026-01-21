import { useQuery } from '@tanstack/react-query';
import { useMindmapApiService } from '@/features/mindmap/api';
import { usePresentationApiService } from '@/features/presentation/api';
import { getAssignmentApiService } from '@/features/assignment/api';
import { groupCompositeIdsByType, type LinkedResource } from '../types/resource';

interface UseLinkedResourcesOptions {
  compositeIds: string[];
  enabled?: boolean;
}

export function useLinkedResources({ compositeIds, enabled = true }: UseLinkedResourcesOptions) {
  const mindmapApiService = useMindmapApiService();
  const presentationApiService = usePresentationApiService();

  return useQuery({
    queryKey: ['linkedResources', compositeIds],
    queryFn: async (): Promise<LinkedResource[]> => {
      if (compositeIds.length === 0) {
        return [];
      }

      const grouped = groupCompositeIdsByType(compositeIds);
      const results: LinkedResource[] = [];

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
              });
            }
          }
        } catch {
          // Ignore errors for individual assignments
        }
      }

      return results;
    },
    enabled: enabled && compositeIds.length > 0,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
}
