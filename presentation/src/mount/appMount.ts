import { createApp, watch, type App } from 'vue';
import { createPinia, storeToRefs } from 'pinia';
import icon from '../plugins/icon';
import directive from '../plugins/directive/index';
import AppComponent from '../views/MainApp.vue';
import 'prosemirror-view/style/prosemirror.css';
import 'animate.css';
import '@/assets/styles/tailwind.css';
import '@/assets/styles/prosemirror.scss';
import '@/assets/styles/font.scss';
import '@/assets/styles/scope.scss';
import '@/assets/styles/tailwind.css';
import i18n from '@/locales';
import { useSlidesStore, useSaveStore } from '@/store';
import { convertToSlide, updateImageSource } from '@/utils/slideLayout';
import type { SlideLayoutSchema, SlideViewport } from '@/utils/slideLayout/types';
import type { PPTImageElement, Slide, SlideTheme } from '@/types/slides';

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
  app.use(i18n);
  icon.install(app);
  directive.install(app);

  app.updateImageElement = async (slideId: string, elementId: string, image: string) => {
    const slidesStore = useSlidesStore();

    const slideIndex = slidesStore.slides.findIndex((s) => s.id === slideId);
    if (slideIndex === -1) return;

    const slide = slidesStore.slides[slideIndex];
    const elementIndex = slide.elements.findIndex((el) => el.id === elementId);
    if (elementIndex === -1) return;

    const element = slide.elements[elementIndex];
    if (element.type !== 'image') return;

    const updatedElement = await updateImageSource(element as PPTImageElement, image);

    const updatedElements = [...slide.elements];
    updatedElements[elementIndex] = updatedElement;

    const updatedSlide = {
      ...slide,
      elements: updatedElements,
    };
    const updatedSlides = [...slidesStore.slides];

    updatedSlides[slideIndex] = updatedSlide;
    slidesStore.setSlides(updatedSlides);

    setTimeout(() => {
      useSaveStore().markSaved();
    }, 20);
  };

  app.replaceSlides = async (dataArray, theme) => {
    const slidesStore = useSlidesStore();
    const viewport: SlideViewport = {
      width: slidesStore.viewportSize,
      height: slidesStore.viewportSize * slidesStore.viewportRatio,
    };

    const themeToUse = theme || slidesStore.theme;

    const newSlides: Slide[] = [];
    for (let i = 0; i < dataArray.length; i++) {
      const slide = await convertToSlide(dataArray[i], viewport, themeToUse, (i + 1).toString());

      newSlides.push(slide);
    }

    // Replace all slides with new ones
    slidesStore.setSlides(newSlides);
    slidesStore.updateSlideIndex(newSlides.length - 1);

    return newSlides;
  };

  app.addSlide = async (data, order, theme) => {
    const slidesStore = useSlidesStore();
    const viewport: SlideViewport = {
      width: slidesStore.viewportSize,
      height: slidesStore.viewportSize * slidesStore.viewportRatio,
    };

    const themeToUse = theme || slidesStore.theme;

    const slide = await convertToSlide(data, viewport, themeToUse, order?.toString());

    // Find image element
    const imageUrl =
      'https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif';
    const imageElementIndex = slide.elements.findIndex((el) => el.type === 'image');

    // Create a slide for the store with loading gif
    const slideForStore = { ...slide };
    if (imageElementIndex !== -1) {
      const imageElement = slide.elements[imageElementIndex] as PPTImageElement;

      // Clone elements array and update image src for store
      slideForStore.elements = [...slide.elements];
      slideForStore.elements[imageElementIndex] = await updateImageSource(imageElement, imageUrl);

      window.dispatchEvent(
        new CustomEvent('app.image.need-generation', {
          detail: {
            slideId: slide.id,
            elementId: imageElement.id,
            prompt: (data as any).data.image,
          },
        })
      );
    }

    // Add slide with loading gif to store
    const currentSlides = slidesStore.slides;
    const updatedSlides = [...currentSlides, slideForStore];
    slidesStore.setSlides(updatedSlides);
    slidesStore.updateSlideIndex(updatedSlides.length - 1);

    // Return slide with empty image src
    const slideToReturn = { ...slide };
    if (imageElementIndex !== -1) {
      const imageElement = slide.elements[imageElementIndex] as PPTImageElement;
      slideToReturn.elements = [...slide.elements];
      slideToReturn.elements[imageElementIndex] = {
        ...imageElement,
        src: '',
      };
    }

    return slideToReturn;
  };

  app.updateThemeAndViewport = (theme: SlideTheme, viewport: SlideViewport) => {
    const slidesStore = useSlidesStore();
    slidesStore.setTheme(theme);
    slidesStore.setViewportSize(viewport.width);
    slidesStore.setViewportRatio(viewport.height / viewport.width);
  };

  app.clearSlides = () => {
    const slidesStore = useSlidesStore();
    slidesStore.setSlides([]);
    slidesStore.updateSlideIndex(0);
  };

  app.parsed = () => {
    const saveStore = useSaveStore();
    saveStore.markSaved();
  };

  app.mount(el);

  return app;
}
