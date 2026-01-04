import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from 'react-i18next';
import { ThemePreviewCard } from './ThemePreviewCard';
import type { SlideTheme } from '../../types/slide';
import { cn } from '@/shared/lib/utils';
import { useInfiniteSlideThemes } from '../../hooks';

interface ThemeGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedThemeId?: string;
  onThemeSelect: (theme: SlideTheme) => void;
}

const ThemeGalleryDialog = ({
  open,
  onOpenChange,
  selectedThemeId,
  onThemeSelect,
}: ThemeGalleryDialogProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'customization' });
  const { themes, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteSlideThemes();

  const handleThemeSelect = (theme: SlideTheme) => {
    onThemeSelect(theme);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('theme.gallery.title')}</DialogTitle>
          <DialogDescription>{t('theme.gallery.description')}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-muted h-24 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {themes.map((theme: SlideTheme) => (
                  <div
                    key={theme.id}
                    className={cn(
                      'cursor-pointer transition-all hover:scale-105',
                      selectedThemeId === theme.id && 'rounded-lg ring-2 ring-blue-500'
                    )}
                    onClick={() => handleThemeSelect(theme)}
                  >
                    <ThemePreviewCard
                      theme={theme}
                      title={theme.name}
                      isSelected={selectedThemeId === theme.id}
                    />
                  </div>
                ))}
              </div>

              {/* Loading indicator for next page */}
              {isFetchingNextPage && (
                <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-muted h-24 animate-pulse rounded-lg" />
                  ))}
                </div>
              )}

              {/* Load More button */}
              {hasNextPage && !isFetchingNextPage && (
                <div className="flex justify-center pt-6">
                  <Button variant="outline" onClick={() => fetchNextPage()}>
                    {t('theme.gallery.loadMore')}
                  </Button>
                </div>
              )}
            </>
          )}
        </ScrollArea>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('theme.gallery.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeGalleryDialog;
