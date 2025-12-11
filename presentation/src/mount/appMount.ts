import { createApp, type App, h } from 'vue';
import { createPinia } from 'pinia';
import icon from '../plugins/icon';
import directive from '../plugins/directive/index';
import queryClientPlugin from '../plugins/queryClient';
import AppComponent from '../views/RemoteApp.vue';
import ThumbnailSlide from '../views/components/ThumbnailSlide/index.vue';
import 'prosemirror-view/style/prosemirror.css';
import 'animate.css';
import '@/assets/styles/tailwind.css';
import '@/assets/styles/prosemirror.scss';
import '@/assets/styles/font.scss';
import '@/assets/styles/scope.scss';
import '@/assets/styles/tailwind.css';
import i18n from '@/locales';
import { toPng } from 'html-to-image';
import { useSlidesStore } from '@/store';

export function mount(el: string | Element, props: Record<string, unknown>) {
  const app = createApp(AppComponent, props) as App<Element> & {
    generateThumbnail?: () => Promise<string | undefined>;
  };

  const pinia = createPinia();
  app.use(pinia);
  app.use(queryClientPlugin);
  app.use(i18n);
  icon.install(app);
  directive.install(app);

  app.mount(el);

  // Add generateThumbnail method to app instance
  app.generateThumbnail = async () => {
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
  };

  return app;
}
