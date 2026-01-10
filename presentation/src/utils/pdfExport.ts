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

  if (slidesPerPage === 1) {
    // Existing single slide per page logic
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width + 2 * margin, height + 2 * margin],
    });

    for (let i = 0; i < slideElements.length; i++) {
      const slideElement = slideElements[i];

      try {
        const imageDataUrl = await captureElementAsImage(slideElement, {
          backgroundColor: 'white',
          quality: 1,
          width: renderSize?.width || width,
          height: renderSize?.height || height,
          scale: scale,
        });

        if (i > 0) {
          pdf.addPage([width + 2 * margin, height + 2 * margin]);
        }

        pdf.addImage(imageDataUrl, 'PNG', margin, margin, width, height);
      } catch (error) {
        console.error(`Failed to capture slide ${i + 1}:`, error);
        throw new Error(`Failed to export slide ${i + 1}`);
      }
    }

    const filename = generatePDFFilename();
    const pdfBlob = pdf.output('blob');
    downloadBlob(pdfBlob, filename);
  } else if (slidesPerPage === 4) {
    // New: 4 slides per page in 2x2 grid
    await exportMultipleSlidesPerPage(slideElements, pageSize, renderSize, scale);
  } else {
    throw new Error(`Unsupported slidesPerPage value: ${slidesPerPage}`);
  }
};

/**
 * Create a composite image with 4 slides in a 2x2 grid layout
 */
const createCompositeSlideImage = async (
  slideElements: HTMLElement[],
  renderSize: { width: number; height: number },
  scale: number
): Promise<string> => {
  // First, capture each slide individually
  const slideImages: string[] = [];

  // Calculate individual slide dimensions
  const padding = 16;
  const gap = 16;
  const slideWidth = (renderSize.width - 2 * padding - gap) / 2;
  const slideHeight = (renderSize.height - 2 * padding - gap) / 2;

  for (const slideElement of slideElements) {
    const imageDataUrl = await captureElementAsImage(slideElement, {
      backgroundColor: 'white',
      quality: 1,
      width: slideWidth,
      height: slideHeight,
      scale: scale,
    });
    slideImages.push(imageDataUrl);
  }

  // Create canvas to compose the grid
  const canvas = document.createElement('canvas');
  canvas.width = renderSize.width;
  canvas.height = renderSize.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Fill background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, renderSize.width, renderSize.height);

  // Load and draw each slide image in grid positions
  const positions = [
    { x: padding, y: padding }, // Top-left
    { x: padding + slideWidth + gap, y: padding }, // Top-right
    { x: padding, y: padding + slideHeight + gap }, // Bottom-left
    { x: padding + slideWidth + gap, y: padding + slideHeight + gap }, // Bottom-right
  ];

  for (let i = 0; i < slideImages.length; i++) {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, positions[i].x, positions[i].y, slideWidth, slideHeight);
        resolve();
      };
      img.onerror = reject;
      img.src = slideImages[i];
    });
  }

  // Convert canvas to data URL
  return canvas.toDataURL('image/png', 1);
};

/**
 * Export multiple slides per page in a 2x2 grid layout
 */
const exportMultipleSlidesPerPage = async (
  slideElements: HTMLElement[],
  pageSize: PageSize,
  renderSize: { width: number; height: number } | undefined,
  scale: number
): Promise<void> => {
  const { width, height, margin } = pageSize;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [width + 2 * margin, height + 2 * margin],
  });

  const slidesPerPage = 4;
  const totalPages = Math.ceil(slideElements.length / slidesPerPage);

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const startIdx = pageIndex * slidesPerPage;
    const endIdx = Math.min(startIdx + slidesPerPage, slideElements.length);
    const pageSlidesElements = slideElements.slice(startIdx, endIdx);

    // Create composite image for this page (2x2 grid)
    const compositeImage = await createCompositeSlideImage(
      pageSlidesElements,
      renderSize || { width, height },
      scale
    );

    if (pageIndex > 0) {
      pdf.addPage([width + 2 * margin, height + 2 * margin]);
    }

    pdf.addImage(compositeImage, 'PNG', margin, margin, width, height);
  }

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
