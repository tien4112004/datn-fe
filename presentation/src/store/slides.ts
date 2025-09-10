import { defineStore } from 'pinia';
import { omit } from 'lodash';
import type {
  Slide,
  SlideTheme,
  PPTElement,
  PPTAnimation,
  SlideTemplate,
  PPTTextElement,
} from '@/types/slides';

interface RemovePropData {
  id: string;
  propName: string | string[];
}

interface UpdateElementData {
  id: string | string[];
  props: Partial<PPTElement>;
  slideId?: string;
}

interface FormatedAnimation {
  animations: PPTAnimation[];
  autoNext: boolean;
}

export interface SlidesState {
  title: string;
  theme: SlideTheme;
  slides: Slide[];
  slideIndex: number;
  viewportSize: number;
  viewportRatio: number;
  templates: SlideTemplate[];
}

export const useSlidesStore = defineStore('slides', {
  state: (): SlidesState => ({
    title: 'Untitled Presentation', // Slide title
    theme: {
      themeColors: ['#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#4472c4', '#70ad47'],
      fontColor: '#333',
      fontName: 'Roboto',
      backgroundColor: '#fff',
      shadow: {
        h: 3,
        v: 3,
        blur: 2,
        color: '#808080',
      },
      outline: {
        width: 2,
        color: '#525252',
        style: 'solid',
      },
      titleFontColor: '#333',
      titleFontName: 'Roboto',
    }, // Theme style
    slides: [], // Slide page data
    slideIndex: 0, // Current page index
    viewportSize: 1000, // Viewport width base
    viewportRatio: 0.5625, // Viewport ratio, default 16:9
    templates: [
      {
        name: 'Red Universal',
        id: 'template_1',
        cover: 'https://asset.pptist.cn/img/template_1.jpg',
      },
      {
        name: 'Blue Universal',
        id: 'template_2',
        cover: 'https://asset.pptist.cn/img/template_2.jpg',
      },
      {
        name: 'Purple Universal',
        id: 'template_3',
        cover: 'https://asset.pptist.cn/img/template_3.jpg',
      },
      {
        name: 'Morandi Color Scheme',
        id: 'template_4',
        cover: 'https://asset.pptist.cn/img/template_4.jpg',
      },
    ], // Templates
  }),

  getters: {
    currentSlide(state) {
      return state.slides[state.slideIndex];
    },

    currentSlideAnimations(state) {
      const currentSlide = state.slides[state.slideIndex];
      if (!currentSlide?.animations) return [];

      const els = currentSlide.elements;
      const elIds = els.map((el) => el.id);
      return currentSlide.animations.filter((animation) => elIds.includes(animation.elId));
    },

    // Formatted current page animations
    // Merge items with trigger condition "with previous animation" to the same position in the sequence
    // Add automatic downward execution mark to the previous item of items with trigger condition "after previous animation"
    formatedAnimations(state) {
      const currentSlide = state.slides[state.slideIndex];
      if (!currentSlide?.animations) return [];

      const els = currentSlide.elements;
      const elIds = els.map((el) => el.id);
      const animations = currentSlide.animations.filter((animation) => elIds.includes(animation.elId));

      const formatedAnimations: FormatedAnimation[] = [];
      for (const animation of animations) {
        if (animation.trigger === 'click' || !formatedAnimations.length) {
          formatedAnimations.push({ animations: [animation], autoNext: false });
        } else if (animation.trigger === 'meantime') {
          const last = formatedAnimations[formatedAnimations.length - 1];
          last.animations = last.animations.filter((item) => item.elId !== animation.elId);
          last.animations.push(animation);
          formatedAnimations[formatedAnimations.length - 1] = last;
        } else if (animation.trigger === 'auto') {
          const last = formatedAnimations[formatedAnimations.length - 1];
          last.autoNext = true;
          formatedAnimations[formatedAnimations.length - 1] = last;
          formatedAnimations.push({ animations: [animation], autoNext: false });
        }
      }
      return formatedAnimations;
    },
  },

  actions: {
    setTitle(title: string) {
      if (!title) this.title = 'Untitled Presentation';
      else this.title = title;
    },

    setTheme(themeProps: Partial<SlideTheme>) {
      this.theme = { ...this.theme, ...themeProps };
    },

    setViewportSize(size: number) {
      this.viewportSize = size;
    },

    setViewportRatio(viewportRatio: number) {
      this.viewportRatio = viewportRatio;
    },

    setSlides(slides: Slide[]) {
      this.slides = slides;
      console.log(this.slides.values);
    },

    setTemplates(templates: SlideTemplate[]) {
      this.templates = templates;
    },

    addSlide(slide: Slide | Slide[]) {
      const slides = Array.isArray(slide) ? slide : [slide];
      for (const slide of slides) {
        if (slide.sectionTag) delete slide.sectionTag;
      }

      const addIndex = this.slideIndex + 1;
      this.slides.splice(addIndex, 0, ...slides);
      this.slideIndex = addIndex;
    },

    appendNewSlide(slide: Slide) {
      this.slides.push(slide);
    },

    updateSlide(props: Partial<Slide>, slideId?: string) {
      const slideIndex = slideId ? this.slides.findIndex((item) => item.id === slideId) : this.slideIndex;
      this.slides[slideIndex] = { ...this.slides[slideIndex], ...props };
    },

    removeSlideProps(data: RemovePropData) {
      const { id, propName } = data;

      const slides = this.slides.map((slide) => {
        return slide.id === id ? omit(slide, propName) : slide;
      }) as Slide[];
      this.slides = slides;
    },

    deleteSlide(slideId: string | string[]) {
      const slidesId = Array.isArray(slideId) ? slideId : [slideId];
      const slides: Slide[] = JSON.parse(JSON.stringify(this.slides));

      const deleteSlidesIndex = [];
      for (const deletedId of slidesId) {
        const index = slides.findIndex((item) => item.id === deletedId);
        deleteSlidesIndex.push(index);

        const deletedSlideSection = slides[index].sectionTag;
        if (deletedSlideSection) {
          const handleSlideNext = slides[index + 1];
          if (handleSlideNext && !handleSlideNext.sectionTag) {
            delete slides[index].sectionTag;
            slides[index + 1].sectionTag = deletedSlideSection;
          }
        }

        slides.splice(index, 1);
      }
      let newIndex = Math.min(...deleteSlidesIndex);

      const maxIndex = slides.length - 1;
      if (newIndex > maxIndex) newIndex = maxIndex;

      this.slideIndex = newIndex;
      this.slides = slides;
    },

    updateSlideIndex(index: number) {
      this.slideIndex = index;
    },

    addElement(element: PPTElement | PPTElement[]) {
      const elements = Array.isArray(element) ? element : [element];
      const currentSlideEls = this.slides[this.slideIndex].elements;
      const newEls = [...currentSlideEls, ...elements];
      this.slides[this.slideIndex].elements = newEls;
    },

    deleteElement(elementId: string | string[]) {
      const elementIdList = Array.isArray(elementId) ? elementId : [elementId];
      const currentSlideEls = this.slides[this.slideIndex].elements;
      const newEls = currentSlideEls.filter((item) => !elementIdList.includes(item.id));
      this.slides[this.slideIndex].elements = newEls;
    },

    updateElement(data: UpdateElementData) {
      const { id, props, slideId } = data;
      const elIdList = typeof id === 'string' ? [id] : id;

      const slideIndex = slideId ? this.slides.findIndex((item) => item.id === slideId) : this.slideIndex;
      const slide = this.slides[slideIndex];
      const elements = slide.elements.map((el) => {
        return elIdList.includes(el.id) ? { ...el, ...props } : el;
      });
      this.slides[slideIndex].elements = elements as PPTElement[];
    },

    removeElementProps(data: RemovePropData) {
      const { id, propName } = data;
      const propsNames = typeof propName === 'string' ? [propName] : propName;

      const slideIndex = this.slideIndex;
      const slide = this.slides[slideIndex];
      const elements = slide.elements.map((el) => {
        return el.id === id ? omit(el, propsNames) : el;
      });
      this.slides[slideIndex].elements = elements as PPTElement[];
    },
  },
});
