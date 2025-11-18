import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { useReactFlow, getNodesBounds } from '@xyflow/react';
import { generateFilename, downloadFile } from '../../utils/exportUtils';

function ExportSVGTab() {
  const { t } = useTranslation('mindmap');
  const { getNodes, getEdges } = useReactFlow();

  const [strokeColor, setStrokeColor] = useState('#000000');
  const [includeBackground, setIncludeBackground] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const nodes = getNodes();
      const edges = getEdges();

      if (nodes.length === 0) {
        console.warn('No nodes to export');
        return;
      }

      // Calculate bounds
      const bounds = getNodesBounds(nodes);
      const padding = 50;
      const width = bounds.width + padding * 2;
      const height = bounds.height + padding * 2;

      // Create SVG content
      let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
`;

      if (includeBackground) {
        svgContent += `  <rect width="100%" height="100%" fill="white"/>
`;
      }

      // Add edges
      edges.forEach((edge) => {
        if (edge.source && edge.target) {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const targetNode = nodes.find((n) => n.id === edge.target);

          if (sourceNode && targetNode) {
            const sourceX = sourceNode.position.x + (sourceNode.width || 100) / 2 - bounds.x + padding;
            const sourceY = sourceNode.position.y + (sourceNode.height || 50) / 2 - bounds.y + padding;
            const targetX = targetNode.position.x + (targetNode.width || 100) / 2 - bounds.x + padding;
            const targetY = targetNode.position.y + (targetNode.height || 50) / 2 - bounds.y + padding;

            svgContent += `  <line x1="${sourceX}" y1="${sourceY}" x2="${targetX}" y2="${targetY}" stroke="${strokeColor}" stroke-width="2"/>
`;
          }
        }
      });

      // Add nodes
      nodes.forEach((node) => {
        const x = node.position.x + (node.width || 100) / 2 - bounds.x + padding;
        const y = node.position.y + (node.height || 50) / 2 - bounds.y + padding;
        const radius = Math.min(node.width || 100, node.height || 50) / 2;

        // Draw node as circle
        svgContent += `  <circle cx="${x}" cy="${y}" r="${radius}" fill="#e1e5e9" stroke="${strokeColor}" stroke-width="2"/>
`;

        // Add label
        if (node.data?.label) {
          svgContent += `  <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="12" fill="#000">${node.data.label}</text>
`;
        }
      });

      svgContent += '</svg>';

      // Create blob and download
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const dataUrl = URL.createObjectURL(blob);
      const filename = generateFilename('svg');
      downloadFile(dataUrl, filename);

      // Clean up
      URL.revokeObjectURL(dataUrl);
    } catch (error) {
      console.error('SVG export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Configuration */}
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-2">
          <Label htmlFor="strokeColor">{t('export.svg.strokeColor')}</Label>
          <input
            id="strokeColor"
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="h-10 w-full rounded border"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeBackground"
            checked={includeBackground}
            onCheckedChange={(checked) => setIncludeBackground(checked as boolean)}
          />
          <Label htmlFor="includeBackground">{t('export.svg.includeBackground')}</Label>
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
            <div className="mb-2 text-lg font-medium">SVG Export</div>
            <div className="text-sm">Generates vector graphics from mindmap nodes and connections</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportSVGTab;
