import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Masonry } from 'masonic';
import { useImageManager } from '../hooks';
import ImageCard from '../components/ImageCard';
import ImagePreviewDialog from '../components/ImagePreviewDialog';
import { ImagePreviewProvider, useImagePreview } from '../context/ImagePreviewContext';
import { Button } from '@ui/button';
import { Loader2, Minus, Plus } from 'lucide-react';
import type { ImageData } from '../types/service';

const COLUMN_SIZES = [150, 200, 250, 300, 350, 400];
const DEFAULT_COLUMN_INDEX = 3; // 300px

interface ImageGalleryContentProps {
  initialImage?: ImageData;
}

const ImageGalleryContent = ({ initialImage }: ImageGalleryContentProps) => {
  const { t } = useTranslation('image');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasOpenedInitialImage = useRef(false);
  const location = useLocation();
  const { images, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useImageManager();
  const { openPreview } = useImagePreview();
  const [columnSizeIndex, setColumnSizeIndex] = useState(DEFAULT_COLUMN_INDEX);

  const columnWidth = COLUMN_SIZES[columnSizeIndex];

  const handleDecrease = () => {
    // Decrease column width = more images per row
    if (columnSizeIndex > 0) {
      setColumnSizeIndex(columnSizeIndex - 1);
    }
  };

  const handleIncrease = () => {
    // Increase column width = fewer images per row
    if (columnSizeIndex < COLUMN_SIZES.length - 1) {
      setColumnSizeIndex(columnSizeIndex + 1);
    }
  };

  // Handle auto-open from initialImage prop or location state
  useEffect(() => {
    if (initialImage && !hasOpenedInitialImage.current) {
      // Open preview for the provided image only once
      openPreview(initialImage);
      hasOpenedInitialImage.current = true;
    } else if (!initialImage) {
      const state = location.state as { newImage?: ImageData; openPreview?: boolean } | null;
      if (state?.newImage && state?.openPreview) {
        openPreview(state.newImage);
        // Clear the state to prevent re-opening on navigation
        window.history.replaceState({}, document.title);
      }
    }
  }, [initialImage, location.state, openPreview]);

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
        <p className="text-muted-foreground text-lg">{t('gallery.noImages')}</p>
        <p className="text-muted-foreground mt-2 text-sm">{t('gallery.noImagesHint')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Grid size controls */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-muted-foreground text-sm">{t('gallery.gridSize')}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrease}
          disabled={columnSizeIndex === 0}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrease}
          disabled={columnSizeIndex === COLUMN_SIZES.length - 1}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <Masonry
        items={images}
        render={ImageCard}
        columnGutter={12}
        columnWidth={columnWidth}
        overscanBy={2}
        key={columnWidth}
      />

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-8 text-center">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        )}
        {!hasNextPage && images.length > 0 && (
          <p className="text-muted-foreground text-sm">{t('gallery.noMoreImages')}</p>
        )}
      </div>
      <ImagePreviewDialog />
    </div>
  );
};

const ImageGalleryPage = ({ initialImage }: { initialImage?: ImageData }) => {
  return (
    <ImagePreviewProvider>
      <ImageGalleryContent initialImage={initialImage} />
    </ImagePreviewProvider>
  );
};

export default ImageGalleryPage;
