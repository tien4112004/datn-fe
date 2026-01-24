<template>
  <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center bg-white">
    <div class="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
  </div>

  <div v-else-if="error" class="fixed inset-0 z-50 flex items-center justify-center bg-white p-4">
    <div class="text-center text-red-500">
      <p class="font-bold">Error loading presentation</p>
      <p class="text-sm">{{ error }}</p>
    </div>
  </div>

  <Mobile v-if="isInitialized" />
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useMainStore, useSnapshotStore, useSlidesStore, useContainerStore } from '@/store';
import { getPresentationWebViewApi } from '@/services/presentation/api';
import { changeLocale } from '@/locales';
import type { Presentation } from '@/types/slides';
import Mobile from './Mobile/index.vue';

const route = useRoute();
const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const snapshotStore = useSnapshotStore();
const containerStore = useContainerStore();
const { slides } = storeToRefs(slidesStore);

const loading = ref(true);
const error = ref<string | null>(null);
const isInitialized = ref(false);

const api = getPresentationWebViewApi();

// Initialize the application with fetched data
const initPresentation = async (presentation: Presentation) => {
  try {
    if (!presentation || !presentation.slides) {
      throw new Error('Invalid presentation data: missing slides');
    }

    // Initialize container store
    containerStore.initialize({
      isRemote: true,
      presentation: presentation,
    });

    // Set slides in store
    slidesStore.setSlides(presentation.slides);

    // Initialize snapshot database
    await snapshotStore.initSnapshotDatabase();

    // Mark as initialized
    isInitialized.value = true;
    loading.value = false;

    // Notify Flutter that presentation is loaded (useful for hiding native loaders)
    if ((window as any).flutter_inappwebview) {
      (window as any).flutter_inappwebview.callHandler('presentationLoaded', {
        success: true,
        slideCount: presentation.slides.length,
      });
    }
  } catch (err) {
    handleError(err);
  }
};

const handleError = (err: unknown) => {
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
};

// Handle slide navigation commands from Flutter (Keep this for remote control)
const handleSlideNavigation = (event: MessageEvent) => {
  const { type, data } = event.data;

  if (type === 'setSlideIndex') {
    const { index } = data;
    if (typeof index === 'number' && index >= 0 && index < slides.value.length) {
      slidesStore.updateSlideIndex(index);
    }
  }
};

onMounted(async () => {
  // 1. Apply locale from localStorage (injected by Flutter WebView)
  const savedLocale = localStorage.getItem('i18nextLng');
  if (savedLocale) {
    changeLocale(savedLocale);
  }

  // 2. Setup Listeners for Navigation (Remote Control)
  window.addEventListener('message', handleSlideNavigation);

  // Expose navigation helper for Flutter
  (window as any).setSlideIndex = (index: number) => {
    handleSlideNavigation({
      data: {
        type: 'setSlideIndex',
        data: { index },
      },
    } as MessageEvent);
  };

  // 3. Notify Flutter view is ready
  if ((window as any).flutter_inappwebview) {
    (window as any).flutter_inappwebview.callHandler('mobileViewReady');
  }

  // 4. Fetch Data Directly via API
  const presentationId = route.params.id as string;

  if (!presentationId) {
    error.value = 'No presentation ID found in URL';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    const presentation = await api.getPresentation(presentationId);
    await initPresentation(presentation);
  } catch (err) {
    handleError(err);
  }
});

onUnmounted(() => {
  window.removeEventListener('message', handleSlideNavigation);
  delete (window as any).setSlideIndex;
});
</script>
