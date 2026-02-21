import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { Alert, AlertDescription } from '@ui/alert';
import { Info } from 'lucide-react';
import type { QuestionBankItem } from '../types';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

interface CopyToPersonalDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  question: QuestionBankItem | null;
  isLoading?: boolean;
}

export function CopyToPersonalDialog({
  open,
  onClose,
  onConfirm,
  question,
  isLoading = false,
}: CopyToPersonalDialogProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, { keyPrefix: 'dialogs.copyToPersonal' });

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border-2 shadow-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <p className="mb-1 font-medium">{t('questionToCopy')}</p>
              <p className="text-muted-foreground">{question.title}</p>
            </AlertDescription>
          </Alert>

          <p className="text-muted-foreground text-sm">{t('message')}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t('copying') : t('copyQuestion')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
