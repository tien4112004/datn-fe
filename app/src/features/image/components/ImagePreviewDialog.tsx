import { Share2, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { useImagePreview } from '../context/ImagePreviewContext';

const ImagePreviewDialog = () => {
  const { t } = useTranslation('image');
  const { isOpen, selectedImage, closePreview } = useImagePreview();

  const handleShare = async () => {
    if (!selectedImage) return;

    const shareUrl = `${window.location.origin}/image/${selectedImage.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('preview.shareTitle'),
          text: selectedImage.prompt,
          url: shareUrl,
        });
      } catch {
        navigator.clipboard.writeText(shareUrl);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const handleDownload = () => {
    if (!selectedImage) return;

    const link = document.createElement('a');
    link.href = selectedImage.url;
    link.download = `ai-image-${selectedImage.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!selectedImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePreview()}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">{t('preview.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('preview.description')}</DialogDescription>
        </DialogHeader>

        {/* Image Display */}
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <img
            src={selectedImage.url}
            alt={selectedImage.prompt || t('card.generatedImage')}
            className="max-h-[60vh] max-w-full rounded-lg object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
            }}
          />
        </div>

        {/* Prompt */}
        {selectedImage.prompt && (
          <div className="mt-4">
            <p className="text-muted-foreground text-sm">{t('preview.prompt')}</p>
            <p className="text-foreground leading-relaxed">{selectedImage.prompt}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3 border-t pt-4">
          <Button onClick={handleDownload} className="flex-1 gap-2">
            <Download className="h-4 w-4" />
            {t('preview.download')}
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1 gap-2">
            <Share2 className="h-4 w-4" />
            {t('preview.share')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
