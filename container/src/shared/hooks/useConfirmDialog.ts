import { useState, useCallback } from 'react';

/**
 * Shared hook for managing confirmation dialog state and pending actions
 *
 * Provides a consistent pattern for confirmation dialogs across the application:
 * - Opens dialog with a pending action
 * - Executes action only when confirmed
 * - Cancels action when dialog is dismissed
 *
 * @example
 * ```tsx
 * const { isOpen, pendingAction, openDialog, confirm, cancel } = useConfirmDialog<Student>();
 *
 * // Open dialog with pending action
 * <Button onClick={() => openDialog(student)}>Delete</Button>
 *
 * // Confirmation dialog
 * <AlertDialog open={isOpen} onOpenChange={(open) => !open && cancel()}>
 *   <AlertDialogAction onClick={() => confirm(deleteStudent)}>
 *     Confirm
 *   </AlertDialogAction>
 * </AlertDialog>
 * ```
 */
export function useConfirmDialog<T = unknown>() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<T | null>(null);

  /**
   * Open the confirmation dialog with a pending action
   * @param action - The action data to be executed if confirmed
   */
  const openDialog = useCallback((action: T) => {
    setPendingAction(action);
    setIsOpen(true);
  }, []);

  /**
   * Execute the confirmed action and close the dialog
   * @param callback - Function to execute with the pending action
   */
  const confirm = useCallback(
    (callback: (action: T) => void) => {
      if (pendingAction !== null) {
        callback(pendingAction);
      }
      setIsOpen(false);
      setPendingAction(null);
    },
    [pendingAction]
  );

  /**
   * Cancel the pending action and close the dialog
   */
  const cancel = useCallback(() => {
    setIsOpen(false);
    setPendingAction(null);
  }, []);

  return {
    isOpen,
    pendingAction,
    openDialog,
    confirm,
    cancel,
  };
}
