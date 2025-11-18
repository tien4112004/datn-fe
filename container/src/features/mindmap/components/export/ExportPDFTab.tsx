import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import {
  generateFilename,
  downloadFile,
  getMindmapViewport,
  getPaperSizeDimensions,
} from '../../utils/exportUtils';

function ExportPDFTab() {
  const { t } = useTranslation('mindmap');
  const { getNodes } = useReactFlow();

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('a4');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const viewport = getMindmapViewport();
      if (!viewport) {
        console.error('Mindmap viewport not found');
        return;
      }

      const nodes = getNodes();
      if (nodes.length === 0) {
        console.warn('No nodes to export');
        return;
      }

      // Calculate dimensions for image export
      const nodesBounds = getNodesBounds(nodes);
      const imageSize = 2048;
      const viewportTransform = getViewportForBounds(nodesBounds, imageSize, imageSize, 0.5, 2, 0.5);

      // Export mindmap as PNG image
      const dataUrl = await toPng(viewport, {
        backgroundColor: 'white',
        width: imageSize,
        height: imageSize,
        style: {
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${viewportTransform.zoom})`,
        },
        skipFonts: true,
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'pt',
        format: paperSize,
      });

      // Get paper dimensions
      const paperDimensions = getPaperSizeDimensions(paperSize, orientation);
      const margin = 20;

      // Calculate image dimensions to fit within paper with margins
      const availableWidth = paperDimensions.width - margin * 2;
      const availableHeight = paperDimensions.height - margin * 2;

      // Calculate scaling to fit image within available space
      const scaleX = availableWidth / imageSize;
      const scaleY = availableHeight / imageSize;
      const scale = Math.min(scaleX, scaleY);

      const imageWidth = imageSize * scale;
      const imageHeight = imageSize * scale;

      // Center the image on the page
      const x = (paperDimensions.width - imageWidth) / 2;
      const y = (paperDimensions.height - imageHeight) / 2;

      // Add image to PDF
      pdf.addImage(dataUrl, 'PNG', x, y, imageWidth, imageHeight);

      // Generate filename and download
      const filename = generateFilename('pdf');
      const pdfBlob = pdf.output('blob');
      const pdfDataUrl = URL.createObjectURL(pdfBlob);
      downloadFile(pdfDataUrl, filename);

      // Clean up
      URL.revokeObjectURL(pdfDataUrl);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Configuration */}
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-2">
          <Label htmlFor="orientation">{t('export.pdf.orientation')}</Label>
          <Select
            value={orientation}
            onValueChange={(value: 'portrait' | 'landscape') => setOrientation(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">{t('export.pdf.portrait')}</SelectItem>
              <SelectItem value="landscape">{t('export.pdf.landscape')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paperSize">{t('export.pdf.paperSize')}</Label>
          <Select value={paperSize} onValueChange={(value: 'a4' | 'letter') => setPaperSize(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4</SelectItem>
              <SelectItem value="letter">Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
            <div className="mb-2 text-lg font-medium">PDF Export</div>
            <div className="text-sm">
              Exports mindmap as a PDF document with selected paper size and orientation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportPDFTab;
