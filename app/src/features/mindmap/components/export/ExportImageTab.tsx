import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useReactFlow, getViewportForBounds } from '@xyflow/react';
import { generateFilename, downloadFile, getMindmapViewport, getImageData } from './utils';
import { PreviewCard } from './PreviewCard';
import { usePreview } from './usePreview';
import { useLatest } from '@/hooks/useLatest';
import { Slider } from '@/components/ui/slider';

interface ExportImageTabProps {
  format: 'png' | 'jpg';
}

const DIMENSION_PRESETS = [
  { label: '1024x1024', value: '1024' },
  { label: '2048x2048', value: '2048' },
  { label: '4096x4096', value: '4096' },
  { label: '8192x8192', value: '8192' },
];

function ExportImageTab({ format }: ExportImageTabProps) {
  const { t } = useTranslation('mindmap');
  const { getNodes, getNodesBounds } = useReactFlow();

  const [dimensions, setDimensions] = useState('2048');
  const [backgroundColor, setBackgroundColor] = useState('white');
  const [quality, setQuality] = useState(1);
  const [padding, setPadding] = useState(0.5);
  const [isExporting, setIsExporting] = useState(false);

  const configRef = useLatest({ format, backgroundColor, quality, padding, dimensions });

  const { previewDataUrl, previewLoading, previewError } = usePreview({
    executor: async () => {
      const { format: f, padding: p, quality: q, backgroundColor: bg, dimensions: d } = configRef.current;

      const viewport = getMindmapViewport();
      if (!viewport) {
        throw new Error('Viewport not found');
      }

      const nodes = getNodes();
      if (nodes.length === 0) {
        throw new Error('No nodes to preview');
      }

      const previewSize = parseInt(d);
      const nodesBounds = getNodesBounds(nodes);
      const viewportTransform = getViewportForBounds(nodesBounds, previewSize, previewSize, 0.01, 100, p);

      return getImageData(f, viewport, {
        backgroundColor: bg,
        quality: q,
        size: previewSize,
        viewportTransform,
      });
    },
    dependencies: [format, backgroundColor, quality, padding, dimensions],
  });

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
      const viewportTransform = getViewportForBounds(nodesBounds, imageSize, imageSize, 0.01, 100, padding);

      const dataUrl = await getImageData(format, viewport, {
        backgroundColor,
        quality,
        size: imageSize,
        viewportTransform,
      });

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

        <div className="space-y-2">
          <Label htmlFor="padding">{t('export.image.padding')}</Label>
          <Slider
            defaultValue={[padding]}
            id="padding"
            min={0}
            max={1}
            step={0.1}
            onValueChange={(value) => setPadding(value[0])}
          />
        </div>

        {format === 'jpg' && (
          <div className="space-y-2">
            <Label htmlFor="quality">
              {t('export.image.quality')}: {Math.round(quality * 100)}%
            </Label>
            <Slider
              defaultValue={[quality]}
              id="quality"
              min={0.1}
              max={1}
              step={0.1}
              onValueChange={(value) => setQuality(value[0])}
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
