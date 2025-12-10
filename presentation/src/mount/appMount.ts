import { createApp, type App } from 'vue';
import { createPinia } from 'pinia';
import icon from '../plugins/icon';
import directive from '../plugins/directive/index';
import queryClientPlugin from '../plugins/queryClient';
import AppComponent from '../views/RemoteApp.vue';
import 'prosemirror-view/style/prosemirror.css';
import 'animate.css';
import '@/assets/styles/tailwind.css';
import '@/assets/styles/prosemirror.scss';
import '@/assets/styles/font.scss';
import '@/assets/styles/scope.scss';
import '@/assets/styles/tailwind.css';
import i18n from '@/locales';
import type { SlideLayoutSchema, SlideViewport } from '@/utils/slideLayout/types';
import type { Slide, SlideTheme } from '@/types/slides';

export function mount(el: string | Element, props: Record<string, unknown>) {
  const app = createApp(AppComponent, props) as App<Element> & {
    updateImageElement?: (slideId: string, elementId: string, image: string) => void;
    replaceSlides?: (data: SlideLayoutSchema[], theme?: SlideTheme) => Promise<Slide[]>;
    addSlide?: (data: SlideLayoutSchema, order?: number, theme?: SlideTheme) => Promise<Slide>;
    updateThemeAndViewport?: (theme: SlideTheme, viewport: SlideViewport) => void;
    clearSlides?: () => void;
    parsed?: () => void;
  };

  const pinia = createPinia();
  app.use(pinia);
  app.use(queryClientPlugin);
  app.use(i18n);
  icon.install(app);
  directive.install(app);

  app.mount(el);

  return app;
}
