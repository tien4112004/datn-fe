import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Button } from '@ui/button';

interface SmallScreenDialogProps {
  minWidth?: number;
  minHeight?: number;
}

/**
 * SmallScreenDialog component
 * Shows a dismissible warning dialog when the viewport is too small.
 * Used in editor pages to notify users that the experience is better on larger screens.
 */
export const SmallScreenDialog = ({ minWidth = 768, minHeight = 600 }: SmallScreenDialogProps) => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation('common');

  useEffect(() => {
    const checkViewport = () => {
      const isTooSmall = window.innerWidth < minWidth || window.innerHeight < minHeight;
      // Only show if viewport is too small and user hasn't dismissed
      if (isTooSmall && !dismissed) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    // Check on mount
    checkViewport();

    // Check on resize
    window.addEventListener('resize', checkViewport);

    return () => {
      window.removeEventListener('resize', checkViewport);
    };
  }, [minWidth, minHeight, dismissed]);

  const handleClose = () => {
    setDismissed(true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="z-[1000] cursor-default sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Monitor className="text-primary h-8 w-8" />
          </div>
          <DialogTitle className="text-center">{t('smallScreen.title')}</DialogTitle>
          <DialogDescription className="text-center">{t('smallScreen.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleClose} className="w-full sm:w-auto">
            {t('smallScreen.understand')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
