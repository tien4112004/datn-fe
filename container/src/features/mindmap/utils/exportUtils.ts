import type { ExportFormat, ExportDimensions } from '../types/export';

// Get mindmap viewport element
export function getMindmapViewport(): HTMLElement | null {
  return document.querySelector('.react-flow__viewport') as HTMLElement;
}

// Calculate optimal dimensions for export
export function calculateExportDimensions(viewport: HTMLElement, format: ExportFormat): ExportDimensions {
  // For now, use fixed dimensions like the current implementation
  // TODO: Could be enhanced to calculate based on actual content bounds
  // The viewport and format parameters are reserved for future enhancements
  console.log('Viewport element:', viewport, 'Format:', format);

  const baseSize = 2048;
  return {
    width: baseSize,
    height: baseSize,
  };
}

// Generate filename with timestamp
export function generateFilename(format: ExportFormat): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `mindmap-${timestamp}.${format}`;
}

// Download file helper
export function downloadFile(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.setAttribute('download', filename);
  a.setAttribute('href', dataUrl);
  a.click();
}

// Convert data URL to blob for PDF generation
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Get paper size dimensions in pixels (assuming 96 DPI)
export function getPaperSizeDimensions(
  paperSize: 'a4' | 'letter',
  orientation: 'portrait' | 'landscape'
): ExportDimensions {
  const sizes = {
    a4: { width: 595, height: 842 }, // A4 at 72 DPI
    letter: { width: 612, height: 792 }, // Letter at 72 DPI
  };

  const size = sizes[paperSize];
  return orientation === 'landscape' ? { width: size.height, height: size.width } : size;
}
