import { useEffect, useState, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';

interface DirtyStateChangedDetail {
  isDirty: boolean;
}

export interface UseUnsavedChangesBlockerOptions {
  /**
   * Custom event name to listen for dirty state changes
   * Default: 'app.unsaved-changes'
   */
  eventName?: string;
}

/**
 * Shared hook to block navigation when there are unsaved changes
 * Can be used by any feature that dispatches a custom event with dirty state
 *
 * @param options Configuration options for the blocker
 * @returns Object with dialog state and handlers
 *
 * @example
 * ```tsx
 * // In your store/dirty state:
 * window.dispatchEvent(
 *   new CustomEvent('app.my-feature.dirty-state-changed', {
 *     detail: { isDirty: true }
 *   })
 * );
 *
 * // In your component:
 * const { showDialog, setShowDialog, handleStay, handleProceed } =
 *   useUnsavedChangesBlocker({
 *     eventName: 'app.my-feature.dirty-state-changed'
 *   });
 * ```
 */
export const useUnsavedChangesBlocker = (options: UseUnsavedChangesBlockerOptions = {}) => {
  const { eventName = 'app.unsaved-changes' } = options;

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Listen to dirty state changes
  useEffect(() => {
    const handleDirtyStateChange = (event: Event) => {
      const customEvent = event as CustomEvent<DirtyStateChangedDetail>;
      setHasUnsavedChanges(customEvent.detail.isDirty);
    };

    const listener = handleDirtyStateChange as unknown as EventListener;
    window.addEventListener(eventName, listener);

    return () => {
      window.removeEventListener(eventName, listener);
      // Reset dirty state when component unmounts
      setHasUnsavedChanges(false);
    };
  }, [eventName]);

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }: { currentLocation: any; nextLocation: any }) => {
        // Block if there are unsaved changes and user is navigating away
        return hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname;
      },
      [hasUnsavedChanges]
    )
  );

  // Show dialog when navigation is blocked
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowDialog(true);
    }
  }, [blocker.state]);

  const handleProceed = () => {
    setShowDialog(false);
    blocker.proceed?.();
  };

  const handleStay = () => {
    setShowDialog(false);
    blocker.reset?.();
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    blocker.reset?.();
  };

  return {
    hasUnsavedChanges,
    showDialog,
    setShowDialog: handleCloseDialog,
    handleStay,
    handleProceed,
  };
};
