import { useEffect, useRef } from 'react';
import { useAssignmentFormStore } from '../stores/useAssignmentFormStore';

export interface UseDirtyFormTrackingOptions {
  eventName?: string;
}

/**
 * Hook to track form dirty state changes and dispatch custom events
 * Used by AssignmentEditorPage to notify unsaved changes blocker
 *
 * Now reads dirty state from Zustand store instead of react-hook-form
 *
 * @param options Configuration options
 * @returns void
 *
 * @example
 * ```tsx
 * useDirtyFormTracking({
 *   eventName: 'app.assignment.dirty-state-changed'
 * });
 * ```
 */
export const useDirtyFormTracking = ({
  eventName = 'app.assignment.dirty-state-changed',
}: UseDirtyFormTrackingOptions = {}) => {
  const isDirty = useAssignmentFormStore((state) => state.isDirty);
  const prevDirtyRef = useRef(false);

  useEffect(() => {
    // Only dispatch event when dirty state actually changes
    if (isDirty !== prevDirtyRef.current) {
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: { isDirty },
        })
      );
      prevDirtyRef.current = isDirty;
    }
  }, [isDirty, eventName]);

  // Reset on unmount
  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: { isDirty: false },
        })
      );
    };
  }, [eventName]);
};
