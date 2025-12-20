import VueRemoteWrapper from '@/remote/VueRemoteWrapper';
import type { Slide } from '@aiprimary/core';

interface TemplatePreviewProps {
  slide: Slide | null;
  loading: boolean;
  error: Error | null;
  previewKey: number;
}

export function TemplatePreview({ slide, loading, error, previewKey }: TemplatePreviewProps) {
  if (loading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center p-4 text-sm">
        Generating slide preview…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-2 text-sm text-red-600">
        Preview generation failed: {error.message}
      </div>
    );
  }

  if (!slide) {
    return (
      <div className="flex items-center justify-center p-4 text-sm text-gray-500">No preview available</div>
    );
  }

  if (slide.elements?.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-sm text-amber-600">
        Preview slide has no elements. Check template configuration.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white" style={{ aspectRatio: '16/9', width: '100%' }}>
      <VueRemoteWrapper
        key={previewKey}
        modulePath="thumbnail"
        mountProps={{ slide, size: 'auto', visible: true }}
        className="h-full w-full"
        LoadingComponent={() => (
          <div className="text-muted-foreground flex items-center justify-center p-4 text-sm">
            Rendering preview...
          </div>
        )}
        ErrorComponent={({ error }: { error: Error }) => (
          <div className="flex items-center justify-center p-4 text-sm text-red-600">
            Preview error: {error.message}
          </div>
        )}
        onMountError={(err) => console.error('Template preview mount error', err)}
      />
    </div>
  );
}
