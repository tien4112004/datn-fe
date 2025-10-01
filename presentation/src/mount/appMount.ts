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
import type { Slide, SlideTheme } from '@/types/slides';
import type { ExtendedSlideTheme } from '@/utils/slideLayout/theme';

export function mount(el: string | Element, props: Record<string, unknown>) {
  const app = createApp(AppComponent, props) as App<Element> & {
    updateImageElement?: (slideId: string, elementId: string, image: string) => void;
    replaceSlides?: (data: SlideLayoutSchema[]) => Promise<Slide[]>;
    addSlide?: (data: SlideLayoutSchema, order?: number) => Promise<Slide>;
    updateThemeAndViewport?: (theme: ExtendedSlideTheme, viewport: SlideViewport) => void;
  };

  const pinia = createPinia();
  app.use(pinia);
  app.use(i18n);
  icon.install(app);
  directive.install(app);

  app.updateImageElement = (slideId: string, elementId: string, image: string) => {
    const slidesStore = useSlidesStore();

    const slideIndex = slidesStore.slides.findIndex((s) => s.id === slideId);
    if (slideIndex === -1) return;

    const slide = slidesStore.slides[slideIndex];
    const elementIndex = slide.elements.findIndex((el) => el.id === elementId);
    if (elementIndex === -1) return;

    const element = slide.elements[elementIndex];
    if (element.type !== 'image') return;

    const updatedElement = {
      ...element,
      src: image,
    };

    const updatedElements = [...slide.elements];
    updatedElements[elementIndex] = updatedElement;

    const updatedSlide = {
      ...slide,
      elements: updatedElements,
    };
    const updatedSlides = [...slidesStore.slides];

    updatedSlides[slideIndex] = updatedSlide;
    slidesStore.setSlides(updatedSlides);
  };

  app.replaceSlides = async (dataArray) => {
    const slidesStore = useSlidesStore();
    const viewport = {
      size: slidesStore.viewportSize,
      ratio: slidesStore.viewportRatio,
    };
    const theme = slidesStore.theme;

    const newSlides: Slide[] = [];
    for (let i = 0; i < dataArray.length; i++) {
      const slide = await convertToSlide(
        dataArray[i],
        viewport,
        theme as ExtendedSlideTheme,
        (i + 1).toString()
      );

      newSlides.push(slide);
    }

    // Replace all slides with new ones
    slidesStore.setSlides(newSlides);
    slidesStore.updateSlideIndex(newSlides.length - 1);

    return newSlides;
  };

  app.addSlide = async (data, order) => {
    const slidesStore = useSlidesStore();
    const viewport = {
      size: slidesStore.viewportSize,
      ratio: slidesStore.viewportRatio,
    };
    const theme = slidesStore.theme;

    const slide = await convertToSlide(data, viewport, theme as ExtendedSlideTheme, order?.toString());

    window.dispatchEvent(
      new CustomEvent('app.image.need-generation', {
        detail: {
          slideId: slide.id,
          elementId: slide.elements.find((el) => el.type === 'image')?.id,
          prompt: (data as any).data.image,
        },
      })
    );

    // Add new slides to existing ones
    const currentSlides = slidesStore.slides;
    const updatedSlides = [...currentSlides, slide];
    slidesStore.setSlides(updatedSlides);
    slidesStore.updateSlideIndex(updatedSlides.length - 1);

    return slide;
  };

  app.updateThemeAndViewport = (theme: SlideTheme, viewport: SlideViewport) => {
    const slidesStore = useSlidesStore();
    slidesStore.setTheme(theme);
    slidesStore.setViewportSize(viewport.size);
    slidesStore.setViewportRatio(viewport.ratio);
  };

  app.mount(el);

  return app;
}
