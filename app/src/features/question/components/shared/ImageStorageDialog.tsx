import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useImages } from '@/features/image/hooks/useApi';
import { Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';
import type { ImageData } from '@/features/image/types/service';

interface ImageStorageDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

export const ImageStorageDialog = ({ open, onClose, onSelect }: ImageStorageDialogProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'shared.imageStorageDialog' });
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  const { images, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useImages();

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage.url);
      setSelectedImage(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    onClose();
  };

  const handleImageClick = (image: ImageData) => {
    setSelectedImage(selectedImage?.id === image.id ? null : image);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-muted-foreground flex h-40 flex-col items-center justify-center">
              <ImageIcon className="mb-2 h-12 w-12" />
              <p>{t('noImages')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 pb-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => handleImageClick(image)}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:scale-105',
                      selectedImage?.id === image.id
                        ? 'border-primary ring-primary ring-2 ring-offset-2'
                        : 'hover:border-muted-foreground/50 border-transparent'
                    )}
                  >
                    <img src={image.url} alt={t('imageAlt')} className="h-full w-full object-cover" />
                    {selectedImage?.id === image.id && (
                      <div className="bg-primary/20 absolute inset-0 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="flex justify-center py-4">
                  <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('loadingMore')}
                      </>
                    ) : (
                      t('loadMore')
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSelect} disabled={!selectedImage}>
            {t('select')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
