<template>
  <ThumbnailSlide v-if="currentSlide" :slide="currentSlide" :size="slideSize" :visible="true" />
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue';
import type { Slide } from '@/types/slides';

const slidesStore = useSlidesStore();
const { slides } = storeToRefs(slidesStore);

const currentSlideIndex = ref(0);
const slideSize = ref<number | 'auto'>('auto');

const currentSlide = computed(() => {
  if (slides.value.length > 0 && currentSlideIndex.value < slides.value.length) {
    return slides.value[currentSlideIndex.value];
  }
  return null;
});

// Function to set slide data from Flutter InAppWebView
const setSlideData = (slideData: Slide | Slide[], slideIndex: number = 0) => {
  if (Array.isArray(slideData)) {
    slidesStore.setSlides(slideData);
    currentSlideIndex.value = slideIndex;
  } else {
    slidesStore.setSlides([slideData]);
    currentSlideIndex.value = 0;
  }
};

// Function to change the current slide index
const setSlideIndex = (index: number) => {
  if (index >= 0 && index < slides.value.length) {
    currentSlideIndex.value = index;
  }
};

// Function to set the thumbnail size
const setSize = (size: number | 'auto') => {
  slideSize.value = size;
};

// Expose functions to window object for Flutter InAppWebView communication
onMounted(() => {
  // Make functions available to Flutter InAppWebView
  (window as any).setSlideData = setSlideData;
  (window as any).setSlideIndex = setSlideIndex;
  (window as any).setThumbnailSize = setSize;

  // Notify Flutter that the view is ready
  if ((window as any).flutter_inappwebview) {
    (window as any).flutter_inappwebview.callHandler('thumbnailViewReady');
  }

  // Also support postMessage for Flutter communication
  window.addEventListener('message', (event) => {
    const { type, data } = event.data;

    switch (type) {
      case 'setSlideData':
        setSlideData(data.slideData, data.slideIndex || 0);
        break;
      case 'setSlideIndex':
        setSlideIndex(data.index);
        break;
      case 'setThumbnailSize':
        setSize(data.size);
        break;
    }
  });
});
</script>

<style lang="scss" scoped>
#app {
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
