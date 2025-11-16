import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStay: () => void;
  onLeave: () => void;
  title?: string;
  description?: string;
  stayLabel?: string;
  leaveLabel?: string;
}

/**
 * Shared UnsavedChangesDialog component
 * Used to confirm navigation away from unsaved changes
 * Can be used by any feature (mindmap, presentation, etc.)
 */
export const UnsavedChangesDialog = ({
  open,
  onOpenChange,
  onStay,
  onLeave,
  title,
  description,
  stayLabel,
  leaveLabel,
}: UnsavedChangesDialogProps) => {
  const { t } = useTranslation('common');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-1000 cursor-default">
        <DialogHeader>
          <DialogTitle>{title || t('presentation.unsavedChanges.title', 'Unsaved Changes')}</DialogTitle>
          <DialogDescription>
            {description ||
              t(
                'presentation.unsavedChanges.description',
                'You have unsaved changes. Do you want to save them before leaving?'
              )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onStay}>
            {stayLabel || t('presentation.unsavedChanges.stay', 'Stay')}
          </Button>
          <Button variant="destructive" onClick={onLeave}>
            {leaveLabel || t('presentation.unsavedChanges.leave', 'Leave')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
