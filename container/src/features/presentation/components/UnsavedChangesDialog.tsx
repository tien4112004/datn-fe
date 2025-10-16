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
}

export const UnsavedChangesDialog = ({ open, onOpenChange, onStay, onLeave }: UnsavedChangesDialogProps) => {
  const { t } = useTranslation('common');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('presentation.unsavedChanges.title')}</DialogTitle>
          <DialogDescription>{t('presentation.unsavedChanges.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onStay}>
            {t('presentation.unsavedChanges.stay')}
          </Button>
          <Button variant="destructive" onClick={onLeave}>
            {t('presentation.unsavedChanges.leave')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
