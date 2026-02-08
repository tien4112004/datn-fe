import { useRef } from 'react';
import { useAssignmentFormStore } from '../stores/useAssignmentFormStore';
import { useDirtyFormTracking } from './useDirtyFormTracking';
import { useUnsavedChangesBlocker } from '@/shared/hooks';

const EVENT_NAME = 'app.assignment.dirty-state-changed';

/**
 * Combines all dirty form tracking and unsaved changes blocking logic
 * into a single hook for the AssignmentEditorPage.
 */
export function useAssignmentDirtyState() {
  const isDirty = useAssignmentFormStore((state) => state.isDirty);
  const markClean = useAssignmentFormStore((state) => state.markClean);

  const saveSuccessRef = useRef(false);

  useDirtyFormTracking({ eventName: EVENT_NAME });

  const { showDialog, setShowDialog, handleStay, handleProceed } = useUnsavedChangesBlocker({
    eventName: EVENT_NAME,
    skipBlockingRef: saveSuccessRef,
  });

  return {
    isDirty,
    markClean,
    saveSuccessRef,
    showDialog,
    setShowDialog,
    handleStay,
    handleProceed,
  };
}
