<template>
  <ThumbnailSlide v-if="currentSlide" :slide="currentSlide" :size="slideSize" :visible="true" />
</template>

<script lang="ts" setup>
/**
 * @deprecated ThumbnailView is deprecated as of switching to image-based thumbnails.
 * This component is kept for backwards compatibility with older Flutter WebView implementations.
 *
 * Migration: Use the ThumbnailSlide component directly or generate thumbnails as images.
 *
 * This view will be removed in a future version.
 */

import { ref, onMounted } from 'vue';
import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue';
import type { Slide } from '@/types/slides';

const currentSlide = ref<Slide | null>(null);
const slideSize = ref<number | 'auto'>('auto');

// Function to set slide data from Flutter InAppWebView
const setSlideData = (slideData: Slide) => {
  currentSlide.value = slideData;
};

// Function to change the current slide (for backwards compatibility)
const setSlideIndex = (_index: number) => {
  // No-op since we only store one slide now
  console.warn('setSlideIndex is deprecated in ThumbnailView - only single slide storage is supported');
};

// Function to set the thumbnail size
const setSize = (size: number | 'auto') => {
  slideSize.value = size;
};

// Expose functions to window object for Flutter InAppWebView communication
onMounted(() => {
  // Deprecation warning
  console.warn(
    '[DEPRECATED] ThumbnailView is deprecated. Please migrate to image-based thumbnails or use ThumbnailSlide component directly. This view will be removed in a future version.'
  );

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
        setSlideData(data.slideData);
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
