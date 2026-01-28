import { useState, useCallback, useMemo } from 'react';
import type { LinkedResource, LinkedResourceType, PermissionLevel } from '../../types/resource';

export interface UseResourceSelectorReturn {
  selectedResources: LinkedResource[];
  defaultPermissionLevel: PermissionLevel;
  isSelected: (type: LinkedResourceType, id: string) => boolean;
  toggleResource: (resource: LinkedResource) => void;
  selectResource: (resource: LinkedResource) => void;
  deselectResource: (type: LinkedResourceType, id: string) => void;
  clearSelection: () => void;
  setSelectedResources: (resources: LinkedResource[]) => void;
  setDefaultPermissionLevel: (level: PermissionLevel) => void;
  updateResourcePermission: (type: LinkedResourceType, id: string, permissionLevel: PermissionLevel) => void;
  setAllResourcesPermission: (permissionLevel: PermissionLevel) => void;
}

export function useResourceSelector(
  initialSelection: LinkedResource[] = [],
  initialPermissionLevel: PermissionLevel = 'view'
): UseResourceSelectorReturn {
  const [selectedResources, setSelectedResources] = useState<LinkedResource[]>(initialSelection);
  const [defaultPermissionLevel, setDefaultPermissionLevel] =
    useState<PermissionLevel>(initialPermissionLevel);

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

  const toggleResource = useCallback(
    (resource: LinkedResource) => {
      setSelectedResources((prev) => {
        const key = `${resource.type}:${resource.id}`;
        const exists = prev.some((r) => `${r.type}:${r.id}` === key);
        if (exists) {
          return prev.filter((r) => `${r.type}:${r.id}` !== key);
        }
        // Add with default permission level if not specified
        const newResource = {
          ...resource,
          permissionLevel: resource.permissionLevel || defaultPermissionLevel,
        };
        return [...prev, newResource];
      });
    },
    [defaultPermissionLevel]
  );

  const selectResource = useCallback(
    (resource: LinkedResource) => {
      setSelectedResources((prev) => {
        const key = `${resource.type}:${resource.id}`;
        const exists = prev.some((r) => `${r.type}:${r.id}` === key);
        if (exists) {
          return prev;
        }
        const newResource = {
          ...resource,
          permissionLevel: resource.permissionLevel || defaultPermissionLevel,
        };
        return [...prev, newResource];
      });
    },
    [defaultPermissionLevel]
  );

  const deselectResource = useCallback((type: LinkedResourceType, id: string) => {
    setSelectedResources((prev) => {
      const key = `${type}:${id}`;
      return prev.filter((r) => `${r.type}:${r.id}` !== key);
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedResources([]);
  }, []);

  const updateResourcePermission = useCallback(
    (type: LinkedResourceType, id: string, permissionLevel: PermissionLevel) => {
      setSelectedResources((prev) =>
        prev.map((r) => (r.type === type && r.id === id ? { ...r, permissionLevel } : r))
      );
    },
    []
  );

  const setAllResourcesPermission = useCallback((permissionLevel: PermissionLevel) => {
    setSelectedResources((prev) => prev.map((r) => ({ ...r, permissionLevel })));
    setDefaultPermissionLevel(permissionLevel);
  }, []);

  return {
    selectedResources,
    defaultPermissionLevel,
    isSelected,
    toggleResource,
    selectResource,
    deselectResource,
    clearSelection,
    setSelectedResources,
    setDefaultPermissionLevel,
    updateResourcePermission,
    setAllResourcesPermission,
  };
}
