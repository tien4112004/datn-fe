import React from 'react';
import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import type { Slide } from '@/features/presentation/types/slide';

interface ThumbnailSlideProps {
  slide: Slide;
  size: number;
  visible: boolean;
}

const LoadingComponent = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">Loading...</div>
);

const ErrorComponent = ({ error }: { error: Error }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600">
    Error loading slide: {error.message}
  </div>
);

const ThumbnailSlide: React.FC<ThumbnailSlideProps> = ({ slide, size, visible }) => {
  return (
    <VueRemoteWrapper
      modulePath="thumbnail"
      mountProps={{
        slide,
        size,
        visible,
      }}
      className="h-auto w-auto"
      LoadingComponent={LoadingComponent}
      ErrorComponent={ErrorComponent}
      onMountError={(error) => {
        console.error('Failed to load Vue ThumbnailSlide:', error);
      }}
    />
  );
};

export default ThumbnailSlide;
