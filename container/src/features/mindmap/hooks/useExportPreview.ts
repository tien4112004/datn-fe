import { useEffect, useState, useCallback, useRef } from 'react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng, toJpeg } from 'html-to-image';
import { getMindmapViewport } from '../utils/exportUtils';

export interface ExportPreviewState {
  dataUrl: string | null;
  loading: boolean;
  error: string | null;
  fileSizeKB: number | null;
}

interface UseExportPreviewProps {
  format: 'png' | 'jpg';
  dimensions: string;
  backgroundColor: string;
  quality?: number;
  enabled?: boolean;
}

/**
 * Hook to generate export preview with debouncing
 * Generates a low-resolution preview for fast rendering
 *
 */
export function useExportPreview({
  format,
  dimensions,
  backgroundColor,
  quality = 1,
  enabled = true,
}: UseExportPreviewProps): ExportPreviewState {
  const { getNodes } = useReactFlow();
  const [state, setState] = useState<ExportPreviewState>({
    dataUrl: null,
    loading: false,
    error: null,
    fileSizeKB: null,
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevConfigRef = useRef<string>('');

  const generatePreview = useCallback(async () => {
    if (!enabled) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const viewport = getMindmapViewport();
      if (!viewport) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Viewport not found',
        }));
        return;
      }

      const nodes = getNodes();
      if (nodes.length === 0) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'No nodes to preview',
        }));
        return;
      }

      // Use lower resolution for preview (512x512 instead of full size)
      const previewSize = 512;
      const nodesBounds = getNodesBounds(nodes);
      const viewportTransform = getViewportForBounds(nodesBounds, previewSize, previewSize, 0.5, 2, 0.5);

      const exportFunction = format === 'png' ? toPng : toJpeg;
      const options: any = {
        backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
        width: previewSize,
        height: previewSize,
        style: {
          width: `${previewSize}px`,
          height: `${previewSize}px`,
          transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${viewportTransform.zoom})`,
        },
        skipFonts: true,
      };

      if (format === 'jpg') {
        options.quality = quality;
      }

      const dataUrl = await exportFunction(viewport, options);

      // Calculate file size (rough estimate based on data URL length)
      const fileSizeBytes = new Blob([dataUrl]).size;
      const fileSizeKB = Math.round(fileSizeBytes / 1024);

      setState({
        dataUrl,
        loading: false,
        error: null,
        fileSizeKB,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate preview';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [format, backgroundColor, quality, enabled, getNodes]);

  // Debounced preview generation on config change
  useEffect(() => {
    const configKey = `${format}-${dimensions}-${backgroundColor}-${quality}`;

    // Skip if config hasn't changed
    if (configKey === prevConfigRef.current) return;
    prevConfigRef.current = configKey;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced generation
    debounceTimerRef.current = setTimeout(() => {
      generatePreview();
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [format, dimensions, backgroundColor, quality, generatePreview]);

  return state;
}
