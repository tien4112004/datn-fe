import type { Slide } from '../../types/slide';
import VueRemoteWrapper from '../remote/VueRemoteWrapper';

interface ThumbnailWrapperProps {
  slide: Slide;
  size: number;
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
      className="h-auto w-auto"
      LoadingComponent={() => (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          Loading...
        </div>
      )}
      ErrorComponent={({ error }: { error: Error }) => (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600">
          Error loading slide: {error.message}
        </div>
      )}
      onMountError={(error) => {
        console.error('Failed to load Vue ThumbnailSlide:', error);
      }}
    />
  );
};

export default ThumbnailWrapper;
