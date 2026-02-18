import { useEffect, useState, useCallback, useRef, type RefObject } from 'react';
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
  /**
   * Optional ref to skip blocking (e.g., after successful save)
   * When ref.current is true, navigation will not be blocked
   */
  skipBlockingRef?: RefObject<boolean>;
  /**
   * Optional async function to auto-save before navigating away.
   * When provided, blocked navigation triggers this instead of showing the dialog.
   * On success: navigation proceeds silently.
   * On failure/timeout: falls back to showing the dialog.
   */
  autoSave?: () => Promise<void>;
  /**
   * Timeout in milliseconds for the autoSave function.
   * If autoSave takes longer than this, falls back to the dialog.
   * Default: 10000 (10 seconds)
   */
  autoSaveTimeout?: number;
}

/**
 * Shared hook to block navigation when there are unsaved changes.
 * Supports optional auto-save: when `autoSave` is provided, navigation
 * triggers a silent save instead of showing a dialog. The dialog is shown
 * only if auto-save fails or times out.
 *
 * @param options Configuration options for the blocker
 * @returns Object with dialog state, handlers, and auto-save status
 */
export const useUnsavedChangesBlocker = (options: UseUnsavedChangesBlockerOptions = {}) => {
  const { eventName = 'app.unsaved-changes', skipBlockingRef, autoSave, autoSaveTimeout = 10000 } = options;

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Use ref to avoid stale closure in useBlocker callback
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  hasUnsavedChangesRef.current = hasUnsavedChanges;

  // Track whether auto-save has been attempted for the current block
  const autoSaveAttemptedRef = useRef(false);

  // Keep latest autoSave ref to avoid stale closures
  const autoSaveRef = useRef(autoSave);
  autoSaveRef.current = autoSave;

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
  // Use ref to always get latest value, avoiding stale closure issues
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }: { currentLocation: any; nextLocation: any }) => {
        // Skip blocking if ref indicates save was successful
        if (skipBlockingRef?.current) {
          return false;
        }
        // Block if there are unsaved changes and user is navigating away
        return hasUnsavedChangesRef.current && currentLocation.pathname !== nextLocation.pathname;
      },
      [skipBlockingRef]
    )
  );

  // Handle blocked navigation: auto-save or show dialog
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (autoSaveRef.current && !autoSaveAttemptedRef.current) {
        // Auto-save: attempt save, then proceed or fall back to dialog
        autoSaveAttemptedRef.current = true;
        setIsAutoSaving(true);

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Auto-save timeout')), autoSaveTimeout);
        });

        Promise.race([autoSaveRef.current(), timeoutPromise])
          .then(() => {
            setIsAutoSaving(false);
            blocker.proceed?.();
          })
          .catch((error) => {
            console.error('Auto-save failed, showing dialog:', error);
            setIsAutoSaving(false);
            setShowDialog(true);
          });
      } else {
        // No autoSave or already attempted: show dialog
        setShowDialog(true);
      }
    } else {
      // Reset attempt tracking when blocker is no longer blocked
      autoSaveAttemptedRef.current = false;
    }
  }, [blocker.state, autoSaveTimeout]);

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
    isAutoSaving,
    showDialog,
    setShowDialog: handleCloseDialog,
    handleStay,
    handleProceed,
  };
};
