import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
}

export const ImageLightbox = ({ src, alt, open, onClose }: ImageLightboxProps) => {
  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={[{ src, alt }]}
      plugins={[Zoom]}
      carousel={{ finite: true }}
      render={{ buttonPrev: () => null, buttonNext: () => null }}
    />
  );
};
