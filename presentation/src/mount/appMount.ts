import { createApp, type App } from 'vue';
import { createPinia } from 'pinia';
import icon from '../plugins/icon';
import directive from '../plugins/directive/index';
import AppComponent from '../App.vue';
import 'prosemirror-view/style/prosemirror.css';
import 'animate.css';
import '@/assets/styles/tailwind.css';
import '@/assets/styles/prosemirror.scss';
import '@/assets/styles/font.scss';
import '@/assets/styles/scope.scss';
import '@/assets/styles/tailwind.css';
import i18n from '@/locales';
import { useSlidesStore } from '@/store';
import type { SlideLayoutSchema } from '@/utils/slideLayout/converters';
import { convertToSlide, type SlideViewport } from '@/utils/slideLayout';
import type { SlideTheme } from '@/types/slides';

export function mount(el: string | Element, props: Record<string, unknown>) {
  const app = createApp(AppComponent, props) as App<Element> & {
    onStreamData?: (data: {
      slides: SlideLayoutSchema[];
      viewport: SlideViewport;
      theme: SlideTheme;
    }) => void;
  };

  const pinia = createPinia();
  app.use(pinia);
  app.use(i18n);
  icon.install(app);
  directive.install(app);

  app.onStreamData = async (data) => {
    const slidesStore = useSlidesStore();

    const slides = data.slides.map(async (slide) => await convertToSlide(slide, data.viewport, data.theme));

    slidesStore.setSlides(await Promise.all(slides));
    slidesStore.setTheme(data.theme);
    slidesStore.setViewportSize(data.viewport.size);
    slidesStore.setViewportRatio(data.viewport.ratio);
    slidesStore.updateSlideIndex(data.slides.length - 1);
  };

  app.mount(el);

  return app;
}
