import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface PageSize {
  width: number;
  height: number;
  margin: number;
}

/**
 * Capture an HTML element as PNG image data URL
 * Uses html-to-image with skipFonts to avoid CORS issues with Google Fonts
 */
export const captureElementAsImage = async (
  element: HTMLElement,
  options?: {
    backgroundColor?: string;
    quality?: number;
    width?: number;
    height?: number;
    scale?: number;
  }
): Promise<string> => {
  // Remove xmlns attributes from foreignObject to avoid issues
  const foreignObjectSpans = element.querySelectorAll('foreignObject [xmlns]');
  foreignObjectSpans.forEach((spanRef) => spanRef.removeAttribute('xmlns'));

  const config: any = {
    backgroundColor: options?.backgroundColor || 'white',
    quality: options?.quality || 1,
    skipFonts: true, // Critical: Skip fonts to avoid CORS issues
    cacheBust: true,
    fontEmbedCSS: '', // Ignore web fonts to avoid CORS
  };

  // If width/height specified, render at that resolution
  // Use style to apply proper scaling
  if (options?.width && options?.height) {
    config.width = options.width;
    config.height = options.height;

    const scale = options?.scale || 1;
    config.style = {
      width: `${options.width}px`,
      height: `${options.height}px`,
      transform: `scale(${scale})`,
    };
  }

  return toPng(element, config);
};

/**
 * Generate a timestamped filename for PDF export
 */
export const generatePDFFilename = (): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `presentation-${timestamp}.pdf`;
};

/**
 * Download a blob as a file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('download', filename);
  a.setAttribute('href', url);
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export slides to PDF
 * @param slideElements Array of slide DOM elements to export
 * @param pageSize Page size configuration
 * @param renderSize Size to render each slide at (for high quality capture)
 * @param slidesPerPage Number of slides to place on each page (default: 1)
 * @param scale Scale factor to apply when capturing slides
 */
export const exportSlidesToPDF = async (
  slideElements: HTMLElement[],
  pageSize: PageSize,
  renderSize?: { width: number; height: number },
  slidesPerPage: number = 1,
  scale: number = 1
): Promise<void> => {
  if (slideElements.length === 0) {
    throw new Error('No slides to export');
  }

  const { width, height, margin } = pageSize;

  // Create PDF document
  const pdf = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width + 2 * margin, height + 2 * margin],
  });

  // For now, only support one slide per page
  // Each slide gets its own page and fills it completely
  for (let i = 0; i < slideElements.length; i++) {
    const slideElement = slideElements[i];

    try {
      // Capture slide as image at full resolution with proper scaling
      const imageDataUrl = await captureElementAsImage(slideElement, {
        backgroundColor: 'white',
        quality: 1,
        width: renderSize?.width || width,
        height: renderSize?.height || height,
        scale: scale,
      });

      // Add new page for subsequent slides
      if (i > 0) {
        pdf.addPage([width + 2 * margin, height + 2 * margin]);
      }

      // Add image to fill the entire page (with margins)
      pdf.addImage(imageDataUrl, 'PNG', margin, margin, width, height);
    } catch (error) {
      console.error(`Failed to capture slide ${i + 1}:`, error);
      throw new Error(`Failed to export slide ${i + 1}`);
    }
  }

  // Generate filename and download
  const filename = generatePDFFilename();
  const pdfBlob = pdf.output('blob');
  downloadBlob(pdfBlob, filename);
};

/**
 * Export a single slide to PDF
 */
export const exportSingleSlideToPDF = async (
  slideElement: HTMLElement,
  pageSize: PageSize,
  renderSize?: { width: number; height: number },
  slidesPerPage: number = 1,
  scale: number = 1
): Promise<void> => {
  return exportSlidesToPDF([slideElement], pageSize, renderSize, slidesPerPage, scale);
};
