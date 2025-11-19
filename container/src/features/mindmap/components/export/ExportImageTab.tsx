import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng, toJpeg } from 'html-to-image';
import { debounce } from 'lodash';
import { generateFilename, downloadFile, getMindmapViewport } from '../../utils/exportUtils';
import { PreviewCard } from './PreviewCard';

interface ExportImageTabProps {
  format: 'png' | 'jpg';
}

const DIMENSION_PRESETS = [
  { label: '1024x1024', value: '1024' },
  { label: '2048x2048', value: '2048' },
  { label: '4096x4096', value: '4096' },
];

function ExportImageTab({ format }: ExportImageTabProps) {
  const { t } = useTranslation('mindmap');
  const { getNodes } = useReactFlow();

  const [dimensions, setDimensions] = useState('2048');
  const [backgroundColor, setBackgroundColor] = useState('white');
  const [quality, setQuality] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Generate preview logic
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

      const nodes = getNodes();
      if (nodes.length === 0) {
        setPreviewError('No nodes to preview');
        setPreviewLoading(false);
        return;
      }

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
      setPreviewDataUrl(dataUrl);
      setPreviewLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate preview';
      setPreviewError(errorMessage);
      setPreviewLoading(false);
    }
  };

  // Create debounced version
  const debouncedGeneratePreview = useRef(debounce(generatePreview, 300)).current;

  // Generate preview when settings change
  useEffect(() => {
    debouncedGeneratePreview();

    return () => {
      debouncedGeneratePreview.cancel();
    };
  }, [format, dimensions, backgroundColor, quality, debouncedGeneratePreview]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const viewport = getMindmapViewport();
      if (!viewport) {
        console.error('Mindmap viewport not found');
        return;
      }

      const nodesBounds = getNodesBounds(getNodes());
      const imageSize = parseInt(dimensions);
      const viewportTransform = getViewportForBounds(nodesBounds, imageSize, imageSize, 0.5, 2, 0.5);

      const exportFunction = format === 'png' ? toPng : toJpeg;
      const options: any = {
        backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
        width: imageSize,
        height: imageSize,
        style: {
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${viewportTransform.zoom})`,
        },
        skipFonts: true,
      };

      if (format === 'jpg') {
        options.quality = quality;
      }

      const dataUrl = await exportFunction(viewport, options);
      const filename = generateFilename(format);
      downloadFile(dataUrl, filename);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Configuration */}
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-2">
          <Label htmlFor="background">{t('export.common.backgroundColor')}</Label>
          <Select value={backgroundColor} onValueChange={setBackgroundColor}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="white">{t('export.common.white')}</SelectItem>
              <SelectItem value="transparent">{t('export.common.transparent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dimensions">{t('export.common.dimensions')}</Label>
          <Select value={dimensions} onValueChange={setDimensions}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIMENSION_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {format === 'jpg' && (
          <div className="space-y-2">
            <Label htmlFor="quality">
              {t('export.image.quality')}: {Math.round(quality * 100)}%
            </Label>
            <input
              id="quality"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        <div className="flex space-x-2 pt-4">
          <Button onClick={handleExport} disabled={isExporting} className="flex-1">
            {isExporting ? t('export.common.exporting') : t('export.common.export')}
          </Button>
        </div>
      </div>

      {/* Right Panel - Preview/Info */}
      <div className="flex-1 border-l p-6">
        <PreviewCard dataUrl={previewDataUrl} loading={previewLoading} error={previewError} />
      </div>
    </div>
  );
}

export default ExportImageTab;
