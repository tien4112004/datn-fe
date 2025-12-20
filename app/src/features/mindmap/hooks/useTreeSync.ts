import { useEffect, useRef } from 'react';
import { useCoreStore } from '../stores';

/**
 * Hook for synchronizing tree view selection with canvas.
 * Provides selection state and auto-scroll-to-selected behavior.
 */
export const useTreeSelectionSync = (nodeId: string) => {
  // Safely check if node is selected, handling cases where selectedNodeIds might not be a Set
  const isSelected = useCoreStore((state) => {
    const selectedIds = state.selectedNodeIds;
    if (!selectedIds) return false;

    // Check if it's a Set
    if (selectedIds instanceof Set) {
      return selectedIds.has(nodeId);
    }

    // Fallback: might be an array after deserialization
    if (Array.isArray(selectedIds)) {
      return (selectedIds as string[]).includes(nodeId);
    }

    return false;
  });

  const nodeRef = useRef<HTMLDivElement>(null);

  // Scroll into view when selected from canvas
  useEffect(() => {
    if (isSelected && nodeRef.current) {
      nodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isSelected]);

  return { isSelected, nodeRef };
};
