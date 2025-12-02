import VueRemoteWrapper from '@/remote/VueRemoteWrapper';
import type { SlideTheme } from '@/types/api';

interface ThemeThumbnailPreviewProps {
  theme: SlideTheme;
  size?: number | 'auto';
}

const ThemeThumbnailPreview = ({ theme, size = 240 }: ThemeThumbnailPreviewProps) => {
  // Build a small slide payload that the ThumbnailSlide expects.
  // The presentation app's ThumbnailSlide expects a slide object. We'll provide a minimal shape.
  const slide = {
    id: 'preview-slide',
    theme,
    content: [],
  };

  return (
    <div className="overflow-hidden rounded-md border" style={{ width: size === 'auto' ? '100%' : size }}>
      <VueRemoteWrapper
        modulePath="thumbnail"
        mountProps={{ slide, size, visible: true }}
        className="h-full w-full"
        LoadingComponent={() => (
          <div className="flex items-center justify-center p-4">Loading preview...</div>
        )}
        ErrorComponent={({ error }: { error: Error }) => (
          <div className="flex items-center justify-center p-4 text-sm text-red-600">
            Error: {error.message}
          </div>
        )}
        onMountError={(err) => console.error('Thumbnail preview mount error', err)}
      />
    </div>
  );
};

export default ThemeThumbnailPreview;
