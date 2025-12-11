import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ImageData } from '../types/service';
import { cn } from '@/shared/lib/utils';

interface ImageCardProps {
  data: ImageData;
  index: number;
}

const ImageCard = memo<ImageCardProps>(({ data }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Default aspect ratio for placeholder
  const aspectRatio = 75; // 4:3 ratio as default

  return (
    <Link to={`/image/${data.id}`} className="group block">
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
              alt={data.prompt || 'Generated image'}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-all duration-300',
                'group-hover:blur-sm',
                isLoaded ? 'opacity-100' : 'opacity-0'
              )}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          {/* Error state */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <span className="text-gray-400 dark:text-gray-600">Failed to load</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-xl font-semibold text-white">View</span>
          </div>
        </div>
      </div>
    </Link>
  );
});

ImageCard.displayName = 'ImageCard';

export default ImageCard;
