import { createApp, h } from 'vue';
import type { Pinia } from 'pinia';
import { toPng } from 'html-to-image';
import { useSlidesStore } from '@/store';
import ThumbnailSlide from '../views/components/ThumbnailSlide/index.vue';
import icon from '../plugins/icon';
import directive from '../plugins/directive/index';
import i18n from '@/locales';

/**
 * Compress image data URL to JPEG format with quality control
 * @param dataUrl - Source image data URL (PNG or JPEG)
 * @param quality - JPEG quality (0-1), default 0.7
 * @param maxSizeKB - Maximum file size in KB, will reduce quality if exceeded
 * @returns Promise resolving to compressed JPEG data URL
 */
async function compressImage(
  dataUrl: string,
  quality: number = 0.7,
  maxSizeKB: number = 800
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      let currentQuality = quality;
      let compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);

      // Reduce quality if file size exceeds limit
      while (currentQuality > 0.1 && getDataUrlSizeKB(compressedDataUrl) > maxSizeKB) {
        currentQuality -= 0.1;
        compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
      }

      resolve(compressedDataUrl);
    };
    img.src = dataUrl;
  });
}

/**
 * Calculate data URL size in KB
 */
function getDataUrlSizeKB(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1];
  const bytes = (base64.length * 3) / 4;
  return bytes / 1024;
}

/**
 * Generates a thumbnail image from the first slide of the presentation
 * @param pinia - Pinia instance to access the slides store
 * @returns Promise resolving to base64 JPEG data URL, or undefined if generation fails
 */
export async function generateThumbnail(pinia: Pinia): Promise<string | undefined> {
  try {
    // Get the slides store from the pinia instance
    const slidesStore = useSlidesStore(pinia);
    const firstSlide = slidesStore.slides[0];

    if (!firstSlide) {
      console.warn('No slides found for thumbnail generation');
      return undefined;
    }

    // Create a temporary container for rendering the thumbnail
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = '800px'; // Fixed width for thumbnail
    container.style.zIndex = '-1';
    document.body.appendChild(container);

    // Create a temporary Vue app to render ThumbnailSlide
    const thumbnailApp = createApp({
      render: () =>
        h(ThumbnailSlide, {
          slide: firstSlide,
          size: 800,
          visible: true,
        }),
    });

    // Use the same pinia instance to access the store data
    thumbnailApp.use(pinia);
    thumbnailApp.use(i18n);
    icon.install(thumbnailApp);
    directive.install(thumbnailApp);

    // Mount the thumbnail component
    thumbnailApp.mount(container);

    // Wait for Vue to render and for any images/fonts to load
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Find the rendered thumbnail-slide element
    const thumbnailElement = container.querySelector('.thumbnail-slide');

    if (!thumbnailElement) {
      console.warn('Thumbnail slide element not found after rendering');
      thumbnailApp.unmount();
      document.body.removeChild(container);
      return undefined;
    }

    // Capture the thumbnail as PNG with reduced pixel ratio
    const dataUrl = await toPng(thumbnailElement as HTMLElement, {
      backgroundColor: 'white',
      skipFonts: true,
      pixelRatio: 1, // Reduced from 2 to avoid large file sizes
      width: 800,
      height: 800 * slidesStore.viewportRatio,
      cacheBust: true,
      fetchRequestInit: {
        cache: 'no-cache',
      },
    });

    // Cleanup
    thumbnailApp.unmount();
    document.body.removeChild(container);

    // Compress to JPEG format to reduce file size (target max 800KB)
    const compressedDataUrl = await compressImage(dataUrl, 0.7, 800);

    return compressedDataUrl;
  } catch (error) {
    console.warn('Failed to generate thumbnail:', error);
    return undefined;
  }
}
