<template>
  <Mobile />
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSnapshotStore, useSlidesStore, useContainerStore } from '@/store';
import type { Presentation } from '@/types/slides';
import Mobile from './Mobile/index.vue';

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const snapshotStore = useSnapshotStore();
const containerStore = useContainerStore();
const { slides } = storeToRefs(slidesStore);

const loading = ref(true);
const error = ref<string | null>(null);
const isInitialized = ref(false);

// Handle presentation data from Flutter
const handlePresentationData = async (event: MessageEvent) => {
  const { type, data } = event.data;

  if (type === 'setPresentationData') {
    try {
      loading.value = true;
      error.value = null;

      const { presentation, isMobile } = data;

      if (!presentation || !presentation.slides || presentation.slides.length === 0) {
        throw new Error('Invalid presentation data: missing slides');
      }

      // Initialize container store with presentation data
      containerStore.initialize({
        isRemote: true,
        presentation: presentation as Presentation,
      });

      // Set slides in store
      slidesStore.setSlides(presentation.slides);

      // Initialize snapshot database
      await snapshotStore.initSnapshotDatabase();

      // Mark as initialized
      isInitialized.value = true;
      loading.value = false;

      // Notify Flutter that presentation is loaded
      if ((window as any).flutter_inappwebview) {
        (window as any).flutter_inappwebview.callHandler('presentationLoaded', {
          success: true,
          slideCount: presentation.slides.length,
        });
      }
    } catch (err) {
      console.error('Error loading presentation:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load presentation';
      loading.value = false;

      // Notify Flutter of error
      if ((window as any).flutter_inappwebview) {
        (window as any).flutter_inappwebview.callHandler('presentationLoaded', {
          success: false,
          error: error.value,
        });
      }
    }
  }
};

// Handle slide navigation from Flutter
const handleSlideNavigation = (event: MessageEvent) => {
  const { type, data } = event.data;

  if (type === 'setSlideIndex') {
    const { index } = data;
    if (typeof index === 'number' && index >= 0 && index < slides.value.length) {
      slidesStore.updateSlideIndex(index);
    }
  }
};

onMounted(() => {
  // Listen for messages from Flutter
  window.addEventListener('message', handlePresentationData);
  window.addEventListener('message', handleSlideNavigation);

  // Notify Flutter that the view is ready
  if ((window as any).flutter_inappwebview) {
    (window as any).flutter_inappwebview.callHandler('mobileViewReady');
  }

  // Also support direct function calls from Flutter
  (window as any).setPresentationData = (presentation: Presentation, isMobile = true) => {
    handlePresentationData({
      data: {
        type: 'setPresentationData',
        data: { presentation, isMobile },
      },
    } as MessageEvent);
  };

  (window as any).setSlideIndex = (index: number) => {
    handleSlideNavigation({
      data: {
        type: 'setSlideIndex',
        data: { index },
      },
    } as MessageEvent);
  };

  // Set a timeout to show error if no data received within 10 seconds
  const timeout = setTimeout(() => {
    if (loading.value) {
      error.value = 'Timeout: No presentation data received from Flutter';
      loading.value = false;
    }
  }, 10000);

  // Clear timeout on unmount
  onUnmounted(() => {
    clearTimeout(timeout);
  });
});

onUnmounted(() => {
  window.removeEventListener('message', handlePresentationData);
  window.removeEventListener('message', handleSlideNavigation);
  delete (window as any).setPresentationData;
  delete (window as any).setSlideIndex;
});
</script>
