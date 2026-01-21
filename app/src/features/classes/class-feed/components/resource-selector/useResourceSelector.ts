import { useState, useCallback, useMemo } from 'react';
import type { LinkedResource, LinkedResourceType } from '../../types/resource';

export interface UseResourceSelectorReturn {
  selectedResources: LinkedResource[];
  isSelected: (type: LinkedResourceType, id: string) => boolean;
  toggleResource: (resource: LinkedResource) => void;
  selectResource: (resource: LinkedResource) => void;
  deselectResource: (type: LinkedResourceType, id: string) => void;
  clearSelection: () => void;
  setSelectedResources: (resources: LinkedResource[]) => void;
}

export function useResourceSelector(initialSelection: LinkedResource[] = []): UseResourceSelectorReturn {
  const [selectedResources, setSelectedResources] = useState<LinkedResource[]>(initialSelection);

  const selectedMap = useMemo(() => {
    const map = new Map<string, LinkedResource>();
    for (const resource of selectedResources) {
      map.set(`${resource.type}:${resource.id}`, resource);
    }
    return map;
  }, [selectedResources]);

  const isSelected = useCallback(
    (type: LinkedResourceType, id: string): boolean => {
      return selectedMap.has(`${type}:${id}`);
    },
    [selectedMap]
  );

  const toggleResource = useCallback((resource: LinkedResource) => {
    setSelectedResources((prev) => {
      const key = `${resource.type}:${resource.id}`;
      const exists = prev.some((r) => `${r.type}:${r.id}` === key);
      if (exists) {
        return prev.filter((r) => `${r.type}:${r.id}` !== key);
      }
      return [...prev, resource];
    });
  }, []);

  const selectResource = useCallback((resource: LinkedResource) => {
    setSelectedResources((prev) => {
      const key = `${resource.type}:${resource.id}`;
      const exists = prev.some((r) => `${r.type}:${r.id}` === key);
      if (exists) {
        return prev;
      }
      return [...prev, resource];
    });
  }, []);

  const deselectResource = useCallback((type: LinkedResourceType, id: string) => {
    setSelectedResources((prev) => {
      const key = `${type}:${id}`;
      return prev.filter((r) => `${r.type}:${r.id}` !== key);
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedResources([]);
  }, []);

  return {
    selectedResources,
    isSelected,
    toggleResource,
    selectResource,
    deselectResource,
    clearSelection,
    setSelectedResources,
  };
}
