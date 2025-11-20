import { useEffect, useRef } from 'react';
import { Masonry } from 'masonic';
import { useImageManager } from '../hooks';
import ImageCard from '../components/ImageCard';
import { Loader2 } from 'lucide-react';

const ImageGalleryPage = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { images, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useImageManager();

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '50%' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Show loading state for initial load
  if (isLoading && images.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show empty state
  if (!isLoading && images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">No images found</p>
        <p className="text-muted-foreground mt-2 text-sm">Create your first image to see it here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Masonry items={images} render={ImageCard} columnGutter={12} columnWidth={300} overscanBy={2} />

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-8 text-center">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        )}
        {!hasNextPage && images.length > 0 && (
          <p className="text-muted-foreground text-sm">No more images to load</p>
        )}
      </div>
    </div>
  );
};

export default ImageGalleryPage;
