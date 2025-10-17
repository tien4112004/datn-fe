import { useEffect, useState, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';

interface DirtyStateChangedDetail {
  isDirty: boolean;
}

export const useUnsavedChangesBlocker = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Listen to dirty state changes from Vue app
  useEffect(() => {
    const handleDirtyStateChange = (event: Event) => {
      const customEvent = event as CustomEvent<DirtyStateChangedDetail>;
      setHasUnsavedChanges(customEvent.detail.isDirty);
    };

    const listener = handleDirtyStateChange as unknown as EventListener;
    window.addEventListener('app.presentation.dirty-state-changed', listener);

    return () => {
      window.removeEventListener('app.presentation.dirty-state-changed', listener);
      // Reset dirty state when component unmounts
      setHasUnsavedChanges(false);
    };
  }, []);

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
    setShowDialog(false);
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
