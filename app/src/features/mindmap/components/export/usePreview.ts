import { useState, useRef, useEffect } from 'react';
import { debounce } from 'lodash';
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

export function usePreview({
  executor,
  dependencies = [],
  debounceDelay = 300,
}: UsePreviewOptions): UsePreviewReturn {
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const generatePreview = async () => {
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const viewport = getMindmapViewport();
      if (!viewport) {
        setPreviewError('Viewport not found');
        setPreviewLoading(false);
        return;
      }

      const dataUrl = await executor();
      setPreviewDataUrl(dataUrl);
      setPreviewLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate preview';
      setPreviewError(errorMessage);
      setPreviewLoading(false);
    }
  };

  // Create debounced version - recreate when executor or debounceDelay changes
  const debouncedGeneratePreview = useRef(debounce(generatePreview, debounceDelay));

  // Update debounced function when executor or debounceDelay changes
  useEffect(() => {
    debouncedGeneratePreview.current = debounce(generatePreview, debounceDelay);
  }, [debounceDelay]);

  // Generate preview when dependencies change
  useEffect(() => {
    debouncedGeneratePreview.current();

    return () => {
      debouncedGeneratePreview.current.cancel();
    };
  }, dependencies);

  return {
    previewDataUrl,
    previewLoading,
    previewError,
  };
}
