import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

export interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: 'presentation' | 'mindmap' | 'assignment';
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

/**
 * Reusable confirmation dialog for deleting presentations or mindmaps
 *
 * Features:
 * - Clear confirmation message with item name and type
 * - Explicit Confirm/Cancel actions
 * - ESC key closes dialog (triggers onCancel)
 * - Disabled during delete operation
 * - Accessible alert dialog pattern from Radix UI
 *
 * @example
 * ```tsx
 * const { isOpen, pendingAction, openDialog, confirm, cancel } = useConfirmDialog<Presentation>();
 *
 * <DeleteConfirmationDialog
 *   open={isOpen}
 *   onOpenChange={(open) => !open && cancel()}
 *   itemName={pendingAction?.title || ''}
 *   itemType="presentation"
 *   onConfirm={() => confirm(handleDelete)}
 *   onCancel={cancel}
 *   isDeleting={deleteMutation.isPending}
 * />
 * ```
 */
export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  itemName,
  itemType,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation('common', { keyPrefix: 'table' });

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
          <AlertDialogTitle>{t(`${itemType}.deleteTitle`)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(`${itemType}.deleteMessage`, { name: itemName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isDeleting}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? t('deleting') : t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
