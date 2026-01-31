import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ImageData } from '../types/service';
import { cn } from '@/shared/lib/utils';
import { useImagePreview } from '../context/ImagePreviewContext';

interface ImageCardProps {
  data: ImageData;
  index: number;
}

const ImageCard = memo<ImageCardProps>(({ data }) => {
  const { t } = useTranslation('image');
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [naturalAspectRatio, setNaturalAspectRatio] = useState<number | null>(null);
  const { openPreview } = useImagePreview();

  // Calculate aspect ratio from natural dimensions, default to 4:3
  const aspectRatio = naturalAspectRatio ?? 75;

  const handleClick = () => {
    openPreview(data);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setIsLoaded(true);
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setNaturalAspectRatio((img.naturalHeight / img.naturalWidth) * 100);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      role="button"
      tabIndex={0}
      className="group block"
    >
      <div className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative bg-gray-200 dark:bg-gray-800" style={{ paddingBottom: `${aspectRatio}%` }}>
          {/* Loading placeholder with gradient animation */}
          {!isLoaded && !imageError && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
          )}

          {/* Image */}
          {!imageError && (
            <img
              src={data.url}
              alt={t('card.generatedImage')}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-all duration-300',
                'group-hover:blur-sm',
                isLoaded ? 'opacity-100' : 'opacity-0'
              )}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={() => setImageError(true)}
            />
          )}

          {/* Error state */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <span className="text-gray-400 dark:text-gray-600">{t('card.failedToLoad')}</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-xl font-semibold text-white">{t('card.view')}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ImageCard.displayName = 'ImageCard';

export default ImageCard;
