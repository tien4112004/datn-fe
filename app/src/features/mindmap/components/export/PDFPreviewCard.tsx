import { getPaperSizeDimensions } from './utils';
import { useTranslation } from 'react-i18next';

interface PDFPreviewCardProps {
  dataUrl: string | null;
  loading: boolean;
  error: string | null;
  orientation: 'portrait' | 'landscape';
  paperSize: 'a4' | 'letter';
}

export function PDFPreviewCard({ dataUrl, loading, error, orientation, paperSize }: PDFPreviewCardProps) {
  const { t } = useTranslation('mindmap');
  const paperDimensions = getPaperSizeDimensions(paperSize, orientation);
  const margin = 20;
  const availableWidth = paperDimensions.width - margin * 2;
  const availableHeight = paperDimensions.height - margin * 2;

  // Calculate image dimensions to fit within paper
  const imageSize = 2048;
  const scaleX = availableWidth / imageSize;
  const scaleY = availableHeight / imageSize;
  const scale = Math.min(scaleX, scaleY);
  const imageWidth = imageSize * scale;
  const imageHeight = imageSize * scale;

  // Aspect ratio for preview display
  const displayScale = 0.4;
  const displayWidth = paperDimensions.width * displayScale;
  const displayHeight = paperDimensions.height * displayScale;
  const displayImageWidth = imageWidth * displayScale;
  const displayImageHeight = imageHeight * displayScale;

  return (
    <div className="flex h-full flex-col items-center justify-center">
      {/* Paper Visualization */}
      <div className="border-border bg-muted flex items-center justify-center rounded-lg border p-4">
        <div
          className="border-foreground/30 relative flex items-center justify-center border border-dashed bg-white shadow-sm"
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
          }}
        >
          {/* Margin indicators */}
          <div
            className="border-border absolute border"
            style={{
              width: `${displayWidth - margin * 2 * displayScale}px`,
              height: `${displayHeight - margin * 2 * displayScale}px`,
              top: `${margin * displayScale}px`,
              left: `${margin * displayScale}px`,
            }}
          />

          {/* Preview indicator */}
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="border-muted-foreground border-t-foreground mb-2 inline-block h-6 w-6 animate-spin rounded-full border-2"></div>
                <p className="text-muted-foreground text-xs">{t('export.preview.generating')}</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-destructive text-xs font-medium">{t('export.preview.error')}</p>
              <p className="text-muted-foreground text-xs">{error}</p>
            </div>
          ) : dataUrl ? (
            <img
              src={dataUrl}
              alt="PDF preview"
              style={{
                width: `${displayImageWidth}px`,
                height: `${displayImageHeight}px`,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
              className="rounded object-contain"
            />
          ) : (
            <p className="text-muted-foreground text-xs">{t('export.preview.adjustSettings')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
