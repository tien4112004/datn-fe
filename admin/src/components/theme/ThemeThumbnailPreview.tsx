import VueRemoteWrapper from '@/remote/VueRemoteWrapper';
import { moduleMethodMap } from '@/remote/module';
import type { Slide, SlideTheme } from '@aiprimary/core';
import { useEffect, useState } from 'react';

interface ThemeThumbnailPreviewProps {
  theme: SlideTheme;
  size?: number | 'auto';
}

const DEFAULT_VIEWPORT = { width: 1000, height: 562.5 };

const ThemeThumbnailPreview = ({ theme, size = 240 }: ThemeThumbnailPreviewProps) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const makePreviews = async () => {
      setLoading(true);
      setError(null);
      setSlides([]);
      try {
        const methodModule = await moduleMethodMap.method();
        const { convertToSlide, getSlideTemplates } = methodModule.default;

        const templates = getSlideTemplates() || [];
        const effectiveTemplates = templates.length
          ? templates
          : [{ type: 'title', data: { title: 'Preview' } }];

        const results = await Promise.allSettled(
          effectiveTemplates.map((tpl: any, i: number) =>
            convertToSlide(tpl, DEFAULT_VIEWPORT, theme, undefined, String(i))
          )
        );

        if (!mounted) return;

        const generatedSlides: Slide[] = results
          .map((r, i) => {
            if (r.status === 'fulfilled') return r.value as Slide;
            // For a failed template conversion, create a placeholder slide with a minimal text element
            return {
              id: `preview-slide-${i}`,
              elements: [
                {
                  id: `preview-text-${i}`,
                  left: 20,
                  top: 20,
                  width: 400,
                  height: 80,
                  rotate: 0,
                  type: 'text',
                  content: 'Preview unavailable',
                  defaultFontName: theme?.fontName || 'Inter',
                  defaultColor: (theme as any)?.fontColor || '#000000',
                },
              ],
              background: theme as any,
            } as Slide;
          })
          .filter(Boolean);

        setSlides(generatedSlides);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    makePreviews();
    return () => {
      mounted = false;
    };
  }, [theme]);

  if (error) {
    return (
      <div className="overflow-hidden rounded-md border" style={{ width: size === 'auto' ? '100%' : size }}>
        <div className="flex items-center justify-center p-4 text-sm text-red-600">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full rounded-md border bg-white"
      style={{ width: size === 'auto' ? '100%' : size, height: size === 'auto' ? '100%' : undefined }}
    >
      <div className="flex max-h-full flex-col gap-3 overflow-y-auto p-3">
        {loading && (
          <div className="flex items-center justify-center p-4">
            {slides.length ? 'Refreshing previews...' : 'Generating previews...'}
          </div>
        )}

        {!loading && slides.length === 0 && (
          <div className="text-muted-foreground flex items-center justify-center p-4 text-sm">
            No templates available
          </div>
        )}

        {slides.map((slide) => (
          <div
            key={slide.id}
            className="rounded-md border bg-white p-1"
            style={{ aspectRatio: '16/9', width: '100%' }}
          >
            <VueRemoteWrapper
              modulePath="thumbnail"
              mountProps={{ slide, size, visible: true }}
              className="h-full w-full"
              LoadingComponent={() => (
                <div className="flex items-center justify-center p-4">Generating preview...</div>
              )}
              ErrorComponent={({ error }: { error: Error }) => (
                <div className="flex items-center justify-center p-4 text-sm text-red-600">
                  Error: {error.message}
                </div>
              )}
              onMountError={(err) => console.error('Thumbnail preview mount error', err)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeThumbnailPreview;
