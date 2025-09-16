import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/dialog';
import { Input } from '@ui/input';
import { Button } from '@ui/button';
import { useTranslation } from 'react-i18next';

interface RenameFileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onRename: (newName: string) => void;
  checkDuplicate?: (name: string) => boolean;
  titleKey?: string;
  placeholderKey?: string;
}

export const RenameFileDialog: React.FC<RenameFileDialogProps> = ({
  isOpen,
  onOpenChange,
  currentName,
  onRename,
  checkDuplicate,
  titleKey = 'common.rename',
  placeholderKey = 'common.newNamePlaceholder',
}) => {
  const { t } = useTranslation('common');
  const [filename, setFilename] = React.useState(currentName);

  // Reset filename when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setFilename(currentName);
    }
  }, [isOpen, currentName]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state before closing
      setFilename(currentName);
    }
    onOpenChange(open);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (filename.trim() === '') return;

    if (checkDuplicate?.(filename.trim())) {
      // TODO: Implement checks
      return;
    }

    onRename(filename.trim());
    handleOpenChange(false);
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t(titleKey)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="filename"
            placeholder={t(placeholderKey)}
            value={filename}
            onChange={(event) => setFilename(event.target.value)}
            autoComplete="off"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={filename.trim() === ''}>
              {t('common.confirm')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
