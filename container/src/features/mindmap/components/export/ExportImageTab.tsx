import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng, toJpeg } from 'html-to-image';
import { generateFilename, downloadFile, getMindmapViewport } from '../../utils/exportUtils';

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
  const [skipFonts, setSkipFonts] = useState(true);
  const [quality, setQuality] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

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
        skipFonts,
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="skipFonts"
            checked={skipFonts}
            onCheckedChange={(checked) => setSkipFonts(checked as boolean)}
          />
          <Label htmlFor="skipFonts">{t('export.common.skipFonts')}</Label>
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
        <div className="text-muted-foreground flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-lg font-medium">Preview</div>
            <div className="text-sm">Export configuration will be applied to the mindmap viewport</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportImageTab;
