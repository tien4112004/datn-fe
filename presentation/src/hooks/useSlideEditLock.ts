import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';

/**
 * Hook for managing slide edit lock state
 * Slides in template preview mode are locked for editing until user confirms template
 */
export default function useSlideEditLock() {
  const slidesStore = useSlidesStore();
  const { currentSlide } = storeToRefs(slidesStore);

  /**
   * Check if a specific slide is in template preview mode (locked)
   * @param slideId - The ID of the slide to check
   * @returns true if slide is locked (in preview mode), false if editable
   */
  const isSlideLocked = (slideId: string): boolean => {
    const slide = slidesStore.slides.find((s) => s.id === slideId);
    return slide?.layout?.isTemplatePreview === true;
  };

  /**
   * Check if current slide is in template preview mode (locked)
   * @returns true if current slide is locked, false if editable
   */
  const isCurrentSlideLocked = computed(() => {
    return currentSlide.value?.layout?.isTemplatePreview === true;
  });

  /**
   * Check if a specific slide is editable
   * @param slideId - The ID of the slide to check
   * @returns true if slide is editable, false if locked
   */
  const isSlideEditable = (slideId: string): boolean => {
    return !isSlideLocked(slideId);
  };

  /**
   * Check if current slide is editable
   * @returns true if current slide is editable, false if locked
   */
  const isCurrentSlideEditable = computed(() => {
    return !isCurrentSlideLocked.value;
  });

  /**
   * Confirm template and unlock slide for editing
   * Exits template preview mode
   * @param slideId - The ID of the slide to unlock
   */
  const confirmTemplate = (slideId: string): void => {
    const slide = slidesStore.slides.find((s) => s.id === slideId);
    if (!slide || !slide.layout) {
      return;
    }

    // Exit preview mode by setting flag to false
    const updatedSlide = {
      ...slide,
      layout: {
        ...slide.layout,
        isTemplatePreview: false,
      },
    };

    slidesStore.updateSlide(updatedSlide, slideId);
  };

  /**
   * Confirm template for current slide
   */
  const confirmCurrentTemplate = (): void => {
    if (currentSlide.value?.id) {
      confirmTemplate(currentSlide.value.id);
    }
  };

  /**
   * Confirm templates for all slides
   * Unlocks all slides that are in template preview mode
   * @returns The number of slides that were confirmed
   */
  const confirmAllTemplates = (): number => {
    let confirmedCount = 0;

    slidesStore.slides.forEach((slide) => {
      if (slide.layout?.isTemplatePreview === true) {
        confirmTemplate(slide.id);
        confirmedCount++;
      }
    });

    return confirmedCount;
  };

  /**
   * Check if any slides are in template preview mode (locked)
   * @returns true if at least one slide is locked
   */
  const hasLockedSlides = computed(() => {
    return slidesStore.slides.some((slide) => slide.layout?.isTemplatePreview === true);
  });

  return {
    isSlideLocked,
    isCurrentSlideLocked,
    isSlideEditable,
    isCurrentSlideEditable,
    confirmTemplate,
    confirmCurrentTemplate,
    confirmAllTemplates,
    hasLockedSlides,
  };
}
