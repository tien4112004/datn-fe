import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/dialog';
import { Input } from '@ui/input';
import { Button } from '@ui/button';
import { useTranslation } from 'react-i18next';
import { Description } from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import type { Presentation } from '@/features/presentation/types';

interface RenameFileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  presentation?: Presentation | null;
  updatePresentationMutation?: any; // The mutation hook result
  onSuccess?: (newName: string) => void;
}

export const RenameFileDialog: React.FC<RenameFileDialogProps> = ({
  isOpen,
  onOpenChange,
  presentation,
  updatePresentationMutation,
  onSuccess,
}) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'list' });
  const currentName = presentation?.title || '';
  const [filename, setFilename] = React.useState(currentName);
  const isLoading = updatePresentationMutation?.isPending || false;

  // Reset filename and set focus when dialog opens
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFilename(currentName);
      // Focus the input after a small delay to ensure the dialog is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select(); // Also select the text for easier editing
      }, 50);
    }
  }, [isOpen, currentName]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFilename(currentName);
      setTimeout(() => onOpenChange(open), 0);
    } else {
      onOpenChange(open);
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const [duplicateError, setDuplicateError] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  // Reset error state when filename changes
  React.useEffect(() => {
    setDuplicateError(false);
    setErrorMessage('');
  }, [filename]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (filename.trim() === '') return; // Only proceed if we have both the presentation and mutation function
    if (presentation && updatePresentationMutation) {
      updatePresentationMutation.mutate(
        { id: presentation.id, name: filename.trim() },
        {
          onSuccess: () => {
            handleOpenChange(false);
            if (onSuccess) onSuccess(filename.trim());
            toast.success(`Presentation renamed to "${filename.trim()}" successfully`);
          },
          onError: (error: unknown) => {
            console.error('Failed to rename presentation:', error);
            // Get a user-friendly error message
            let message = 'Unknown error occurred';
            if (error instanceof Error) {
              message = error.message;
            } else if (typeof error === 'string') {
              message = error;
            } else if (
              error &&
              typeof error === 'object' &&
              'message' in (error as Record<string, unknown>)
            ) {
              message = String((error as Record<string, unknown>).message);
            }

            // Check if it's a duplicate title error (409 Conflict)
            if (message.includes('already exists')) {
              setDuplicateError(true);
              setErrorMessage(message);
            } else {
              // Show general error notification for other errors
              toast.error(`Failed to rename presentation: ${message}`);
            }
          },
        }
      );
    }
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  // Force cleanup of dialog when closed
  if (!isOpen) return null;

  return (
    <Dialog modal open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] sm:max-w-[425px]">
        <Description></Description>
        {
          // Đéo hiểu tại sao lại phải có cái này, không là nó warning
        }
        <DialogHeader>
          <DialogTitle>{t('filenameDialog.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              ref={inputRef}
              id="filename"
              placeholder={t('filenameDialog.newNamePlaceholder')}
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              autoComplete="off"
              disabled={isLoading}
              className={duplicateError ? 'border-red-500' : ''}
            />
            {duplicateError && (
              <p className="text-sm text-red-500">
                {errorMessage ||
                  t('filenameDialog.duplicateError', 'A presentation with this name already exists')}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={filename.trim() === '' || isLoading || duplicateError}
              onClick={handleSubmit}
            >
              {isLoading ? `${t('common.loading')}...` : t('common.confirm')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
