import { createApp, h } from 'vue';
import type { Pinia } from 'pinia';
import { toPng } from 'html-to-image';
import { useSlidesStore } from '@/store';
import ThumbnailSlide from '../views/components/ThumbnailSlide/index.vue';
import icon from '../plugins/icon';
import directive from '../plugins/directive/index';
import i18n from '@/locales';

/**
 * Generates a thumbnail image from the first slide of the presentation
 * @param pinia - Pinia instance to access the slides store
 * @returns Promise resolving to base64 PNG data URL, or undefined if generation fails
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

    // Capture the thumbnail as PNG
    const dataUrl = await toPng(thumbnailElement as HTMLElement, {
      backgroundColor: 'white',
      skipFonts: true,
      pixelRatio: 2,
      width: 800,
      height: 800 * slidesStore.viewportRatio,
    });

    // Cleanup
    thumbnailApp.unmount();
    document.body.removeChild(container);

    return dataUrl;
  } catch (error) {
    console.warn('Failed to generate thumbnail:', error);
    return undefined;
  }
}
