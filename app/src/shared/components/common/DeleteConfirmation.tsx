import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/alert-dialog';

export interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  title?: string;
  description?: string;
}

/**
 * Confirmation dialog for deleting an item
 *
 * Features:
 * - Clear confirmation message
 * - Explicit Confirm/Cancel actions
 * - ESC key closes dialog (triggers onCancel)
 * - Disabled during delete operation
 * - Accessible alert dialog pattern from Radix UI
 *
 * @example
 * ```tsx
 * const { isOpen, data, openDialog, confirm, cancel } = useConfirmDialog<T>();
 *
 * <DeleteConfirmation
 *   open={isOpen}
 *   onOpenChange={(open) => !open && cancel()}
 *   onConfirm={confirm}
 *   onCancel={cancel}
 *   title={"Confirm Deletion"}
 *   description={"Are you sure you want to delete this item?"}
 * />
 * ```
 */
export function DeleteConfirmation({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isDeleting = false,
  title,
  description,
}: DeleteConfirmationProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isDeleting) {
      onCancel();
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
