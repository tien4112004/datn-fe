import { Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { PopoverTrigger } from '@/shared/components/ui/popover';
import { useTranslation } from 'react-i18next';

/**
 * Floating Action Button for the image generator
 * Positioned fixed in the bottom-right corner, always accessible
 * Wrapped in PopoverTrigger to control popover open/close
 */
export const FloatingImageGeneratorFAB = () => {
  const { t } = useTranslation('image');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <PopoverTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 z-[100] h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110"
            size="icon"
            aria-label={t('floating.generateButtonLabel')}
          >
            <Sparkles className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
      </TooltipTrigger>
      <TooltipContent>{t('floating.generateButtonLabel')}</TooltipContent>
    </Tooltip>
  );
};
