import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

interface MatrixDeleteDialogProps {
  open: boolean;
  matrixCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const MatrixDeleteDialog = ({ open, matrixCount, onClose, onConfirm }: MatrixDeleteDialogProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
          <DialogDescription>{t('deleteDialog.description', { count: matrixCount })}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('deleteDialog.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {t('deleteDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
