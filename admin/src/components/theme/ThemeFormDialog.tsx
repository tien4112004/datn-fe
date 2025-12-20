import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { SlideTheme } from '@aiprimary/core';
import ThemeForm from './ThemeForm';

interface ThemeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme?: SlideTheme | null;
  onSubmit: (theme: SlideTheme) => void;
  isPending?: boolean;
}

export function ThemeFormDialog({
  open,
  onOpenChange,
  theme,
  onSubmit,
  isPending = false,
}: ThemeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] !max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{theme ? 'Edit Theme' : 'Create New Theme'}</DialogTitle>
          <DialogDescription>
            {theme ? 'Update the theme details below' : 'Configure a new slide theme'}
          </DialogDescription>
        </DialogHeader>

        <ThemeForm
          initialTheme={theme}
          onSubmit={(t) => {
            onSubmit(t);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ThemeFormDialog;
