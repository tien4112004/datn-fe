import type { Slide } from '../../types/slide';
import type { Presentation } from '../../types/presentation';
import VueRemoteWrapper from '../remote/VueRemoteWrapper';

interface ThumbnailWrapperProps {
  slide: Slide;
  size: number | 'auto';
  visible: boolean;
}

const ThumbnailWrapper = ({ slide, size, visible }: ThumbnailWrapperProps) => {
  return (
    <VueRemoteWrapper
      modulePath="thumbnail"
      mountProps={{
        slide,
        size,
        visible,
      }}
      className="h-full w-full"
      LoadingComponent={() => (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
            <div className="h-16 w-16 animate-pulse rounded-full bg-gray-300/50" />
            <div className="space-y-2">
              <div className="h-3 w-32 animate-pulse rounded-full bg-gray-300/50" />
              <div className="h-2 w-24 animate-pulse rounded-full bg-gray-300/50" />
            </div>
          </div>
        </div>
      )}
      ErrorComponent={({ error }: { error: Error }) => (
        <div className="flex items-center justify-center bg-red-100 text-red-600">
          Error loading slide: {error.message}
        </div>
      )}
      onMountError={(error) => {
        console.error('Failed to load Vue ThumbnailSlide:', error);
      }}
    />
  );
};

interface ThumbnailWrapperV2Props {
  presentation: Presentation;
  size: number | 'auto';
  visible?: boolean;
}

const ThumbnailWrapperV2 = ({ presentation, size, visible = true }: ThumbnailWrapperV2Props) => {
  // If presentation has a thumbnail as an object (Slide), render it
  if (presentation.thumbnail && typeof presentation.thumbnail === 'object') {
    return <ThumbnailWrapper slide={presentation.thumbnail} size={size} visible={visible} />;
  }

  // If presentation has a thumbnail as a string (base64 or URL), render img tag
  if (typeof presentation.thumbnail === 'string') {
    return (
      <img
        src={presentation.thumbnail}
        alt="Presentation Thumbnail"
        className="aspect-[16/9]"
        style={size !== 'auto' ? { width: `${size}px` } : { width: '100%' }}
      />
    );
  }

  // If no thumbnail but presentation has slides, use the first slide
  if (presentation.slides && presentation.slides[0]) {
    return <ThumbnailWrapper slide={presentation.slides[0]} size={size} visible={visible} />;
  }

  // Fallback to placeholder image
  return (
    <img
      src="/images/placeholder-image.webp"
      alt="No Thumbnail"
      style={size !== 'auto' ? { width: `${size}px` } : { width: '100%' }}
    />
  );
};

export default ThumbnailWrapper;
export { ThumbnailWrapperV2 };
