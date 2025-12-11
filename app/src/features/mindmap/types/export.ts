// Export configuration types for mindmap export functionality

export interface ExportDimensions {
  width: number;
  height: number;
}

export interface BaseExportOptions {
  backgroundColor?: string;
  skipFonts?: boolean;
  dimensions: ExportDimensions;
}

// Format-specific options
export interface PNGExportOptions extends BaseExportOptions {
  format: 'png';
}

export interface JPGExportOptions extends BaseExportOptions {
  format: 'jpg';
  quality: number; // 0-1
}

export interface SVGExportOptions extends BaseExportOptions {
  format: 'svg';
  strokeColor?: string;
}

export interface PDFExportOptions extends BaseExportOptions {
  format: 'pdf';
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'a4' | 'letter';
}

export type ExportOptions = PNGExportOptions | JPGExportOptions | SVGExportOptions | PDFExportOptions;

export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf';

// Export result types
export interface ExportResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
  filename?: string;
}

// Export hook return type
export interface UseExportReturn {
  exportMindmap: (options: ExportOptions) => Promise<ExportResult>;
  isExporting: boolean;
}
