import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Info } from 'lucide-react';
import type { QuestionBankItem } from '@/features/assignment/types';

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
  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Copy to Personal Bank</DialogTitle>
          <DialogDescription>
            This will create a copy of this question in your personal bank.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <p className="mb-1 font-medium">Question to copy:</p>
              <p className="text-muted-foreground">{question.title}</p>
            </AlertDescription>
          </Alert>

          <p className="text-muted-foreground text-sm">
            The copied question will be added to your personal bank and can be edited or deleted as needed.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Copying...' : 'Copy Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
