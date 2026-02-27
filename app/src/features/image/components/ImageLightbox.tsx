import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { Download } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
  originalFilename?: string;
  imageId?: string;
}

export const ImageLightbox = ({ src, alt, open, onClose, originalFilename, imageId }: ImageLightboxProps) => {
  const handleDownload = () => {
    fetch(src)
      .then(async (response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        let fileName = originalFilename || '';
        if (!fileName) {
          try {
            const urlParts = src.split('/');
            fileName = urlParts[urlParts.length - 1].split('?')[0];
          } catch {
            fileName = `image-${imageId ?? 'download'}.jpg`;
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
        window.open(src, '_blank');
      });
  };

  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={[{ src, alt }]}
      plugins={[Zoom]}
      carousel={{ finite: true }}
      render={{ buttonPrev: () => null, buttonNext: () => null }}
      toolbar={{
        buttons: [
          <button
            key="download"
            type="button"
            className="yarl__button"
            onClick={handleDownload}
            aria-label="Download"
          >
            <Download className="yarl__icon" />
          </button>,
          'close',
        ],
      }}
    />
  );
};
