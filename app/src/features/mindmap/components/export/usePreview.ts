import { useState, useRef, useEffect } from 'react';
import { getMindmapViewport } from './utils';

interface UsePreviewOptions {
  executor: () => Promise<string>;
  dependencies?: any[];
  debounceDelay?: number;
}

interface UsePreviewReturn {
  previewDataUrl: string | null;
  previewLoading: boolean;
  previewError: string | null;
}

// Wait for the browser to actually paint before continuing.
// Double rAF guarantees a frame has been committed to the screen.
const waitForPaint = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

export function usePreview({
  executor,
  dependencies = [],
  debounceDelay = 300,
}: UsePreviewOptions): UsePreviewReturn {
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Always reference the latest executor without re-triggering effects
  const executorRef = useRef(executor);
  executorRef.current = executor;

  useEffect(() => {
    // Show loading immediately when dependencies change
    setPreviewLoading(true);
    setPreviewError(null);

    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      // Wait for the loading spinner to actually paint on screen
      await waitForPaint();

      if (cancelled) return;

      try {
        const viewport = getMindmapViewport();
        if (!viewport) {
          setPreviewError('Viewport not found');
          setPreviewLoading(false);
          return;
        }

        const dataUrl = await executorRef.current();
        if (!cancelled) {
          setPreviewDataUrl(dataUrl);
          setPreviewLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate preview';
          setPreviewError(errorMessage);
          setPreviewLoading(false);
        }
      }
    }, debounceDelay);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, dependencies);

  return {
    previewDataUrl,
    previewLoading,
    previewError,
  };
}
