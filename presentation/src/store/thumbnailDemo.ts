import { defineStore } from 'pinia';
import type { Slide } from '@/types/slides';

export interface ThumbnailDemoState {
  demoSlides: Slide[];
  currentIndex: number;
  loading: boolean;
}

export const useThumbnailDemoStore = defineStore('thumbnailDemo', {
  state: (): ThumbnailDemoState => ({
    demoSlides: [
      {
        id: 'demo-slide-1',
        elements: [
          {
            type: 'text',
            id: 'text-1',
            left: 100,
            top: 100,
            width: 300,
            height: 60,
            content: 'Demo Slide 1',
            rotate: 0,
            defaultFontName: 'Arial',
            defaultColor: '#333333',
          },
        ],
      },
      {
        id: 'demo-slide-2',
        elements: [
          {
            type: 'text',
            id: 'text-2',
            left: 100,
            top: 100,
            width: 300,
            height: 60,
            content: 'Demo Slide 2',
            rotate: 0,
            defaultFontName: 'Arial',
            defaultColor: '#333333',
          },
        ],
      },
      {
        id: 'demo-slide-3',
        elements: [
          {
            type: 'text',
            id: 'text-3',
            left: 100,
            top: 100,
            width: 300,
            height: 60,
            content: 'Demo Slide 3',
            rotate: 0,
            defaultFontName: 'Arial',
            defaultColor: '#333333',
          },
        ],
      },
      {
        id: 'demo-slide-4',
        elements: [
          {
            type: 'text',
            id: 'text-4',
            left: 100,
            top: 100,
            width: 300,
            height: 60,
            content: 'Demo Slide 4',
            rotate: 0,
            defaultFontName: 'Arial',
            defaultColor: '#333333',
          },
        ],
      },
    ],
    currentIndex: 0,
    loading: false,
  }),

  getters: {
    totalSlides: (state) => state.demoSlides.length,

    currentSlide: (state) => {
      return state.demoSlides[state.currentIndex] || null;
    },

    hasPrevious: (state) => state.currentIndex > 0,

    hasNext: (state) => state.currentIndex < state.demoSlides.length - 1,
  },

  actions: {
    setCurrentIndex(index: number) {
      if (index >= 0 && index < this.demoSlides.length) {
        this.currentIndex = index;
      }
    },

    nextSlide() {
      if (this.hasNext) {
        this.currentIndex++;
      }
    },

    previousSlide() {
      if (this.hasPrevious) {
        this.currentIndex--;
      }
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    addDemoSlide(slide: Slide) {
      this.demoSlides.push(slide);
    },

    removeDemoSlide(slideId: string) {
      const index = this.demoSlides.findIndex((slide) => slide.id === slideId);
      if (index !== -1) {
        this.demoSlides.splice(index, 1);
        if (this.currentIndex >= this.demoSlides.length) {
          this.currentIndex = Math.max(0, this.demoSlides.length - 1);
        }
      }
    },

    updateDemoSlide(slideId: string, updates: Partial<Slide>) {
      const index = this.demoSlides.findIndex((slide) => slide.id === slideId);
      if (index !== -1) {
        this.demoSlides[index] = { ...this.demoSlides[index], ...updates };
      }
    },
  },
});
