import { Share2, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@ui/dialog';
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

    // Try to fetch the image as a blob and download with the original file name if possible
    fetch(selectedImage.url)
      .then(async (response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        // Try to extract file name from selectedImage or fallback
        let fileName = selectedImage.originalFilename || '';
        if (!fileName) {
          // Try to extract from URL
          try {
            const urlParts = selectedImage.url.split('/');
            fileName = urlParts[urlParts.length - 1].split('?')[0];
          } catch {
            fileName = `ai-image-${selectedImage.id}.jpg`;
          }
        }
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      })
      .catch(() => {
        // fallback: open image in new tab
        window.open(selectedImage.url, '_blank');
      });
  };

  if (!selectedImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closePreview}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="sr-only">{t('preview.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('preview.description')}</DialogDescription>
        </DialogHeader>

        {/* Image Display */}
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <img
            src={selectedImage.url}
            alt={t('card.generatedImage')}
            className="max-h-[60vh] max-w-full rounded-lg object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3 border-t pt-4">
          <Button onClick={handleDownload} className="flex-1 gap-2">
            <Download className="h-4 w-4" />
            {t('preview.download')}
          </Button>
          <Button onClick={handleShare} variant="outline" className="invisible flex-1 gap-2">
            <Share2 className="h-4 w-4" />
            {t('preview.share')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
