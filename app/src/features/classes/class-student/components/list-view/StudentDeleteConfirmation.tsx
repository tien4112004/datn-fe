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
} from '@ui/alert-dialog';

export interface StudentDeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

/**
 * Confirmation dialog for deleting a student from the roster
 *
 * Features:
 * - Clear confirmation message with student's full name
 * - Explicit Confirm/Cancel actions
 * - ESC key closes dialog (triggers onCancel)
 * - Disabled during delete operation
 * - Accessible alert dialog pattern from Radix UI
 *
 * @example
 * ```tsx
 * const { isOpen, data, openDialog, confirm, cancel } = useConfirmDialog<Student>();
 *
 * <StudentDeleteConfirmation
 *   open={isOpen}
 *   onOpenChange={(open) => !open && cancel()}
 *   studentName={data?.fullName || ''}
 *   onConfirm={confirm}
 *   onCancel={cancel}
 * />
 * ```
 */
export function StudentDeleteConfirmation({
  open,
  onOpenChange,
  studentName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: StudentDeleteConfirmationProps) {
  const { t } = useTranslation('classes', { keyPrefix: 'roster.confirmation' });

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
          <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteMessage', { studentName })} {t('deleteWarning')}
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
