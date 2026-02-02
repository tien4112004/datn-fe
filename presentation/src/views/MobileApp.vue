<template>
  <!-- Loading state only for view mode (generation mode loading is handled by Flutter) -->
  <div
    v-if="loading && !isGenerationMode"
    class="fixed inset-0 z-50 flex items-center justify-center bg-white"
  >
    <div class="text-center">
      <div class="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
    </div>
  </div>

  <div v-else-if="error" class="fixed inset-0 z-50 flex items-center justify-center bg-white p-4">
    <div class="text-center text-red-500">
      <p class="font-bold">{{ isGenerationMode ? 'Generation Error' : 'Error loading presentation' }}</p>
      <p class="text-sm">{{ error }}</p>
    </div>
  </div>

  <!-- Generation Mode: Use MobileGenerationViewer (handles its own streaming) -->
  <MobileGenerationViewer
    v-else-if="isGenerationMode && presentation && generationRequest"
    :presentation="presentation"
    :generationRequest="generationRequest"
    @ready="onViewerReady"
    @completed="onGenerationCompleted"
    @error="onGenerationError"
  />

  <!-- View Mode: Use RemoteApp -->
  <RemoteApp v-else-if="presentation" :isRemote="true" :presentation="presentation" :mode="'view'" />
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import { getPresentationApi } from '@/services/presentation/api';
import { changeLocale } from '@/locales';
import type { Presentation } from '@/types/slides';
import RemoteApp from './RemoteApp.vue';
import MobileGenerationViewer from './MobileGenerationViewer.vue';
import { useGenerationStore } from '@/store/generation';

const route = useRoute();
const slidesStore = useSlidesStore();
const generationStore = useGenerationStore();
const { slides } = storeToRefs(slidesStore);

const loading = ref(true);
const error = ref<string | null>(null);
const presentation = ref<Presentation | null>(null);
const generationRequest = ref<any>(null);

// Determine mode from route meta
const isGenerationMode = computed(() => route.meta.mode === 'generate');

const api = getPresentationApi();

// Notify Flutter helper
const notifyFlutter = (handler: string, data: any) => {
  if ((window as any).flutter_inappwebview) {
    (window as any).flutter_inappwebview.callHandler(handler, data);
  }
};

const handleError = (err: unknown) => {
  console.error('Error:', err);
  error.value = err instanceof Error ? err.message : 'Failed to load';
  loading.value = false;

  // Notify Flutter of error
  if (isGenerationMode.value) {
    notifyFlutter('generationCompleted', { success: false, error: error.value });
  } else {
    notifyFlutter('presentationLoaded', { success: false, error: error.value });
  }
};

// Handle slide navigation commands from Flutter (for viewing mode)
const handleSlideNavigation = (event: MessageEvent) => {
  const { type, data } = event.data;

  if (type === 'setSlideIndex') {
    const { index } = data;
    if (typeof index === 'number' && index >= 0 && index < slides.value.length) {
      slidesStore.updateSlideIndex(index);
    }
  }
};

// Handle viewer ready - signal Flutter to show WebView
const onViewerReady = () => {
  console.log('[MobileApp] Generation viewer ready');
  notifyFlutter('generationViewReady', {});
};

// Handle generation completed from MobileGenerationViewer
const onGenerationCompleted = (data: { success: boolean; slideCount: number }) => {
  console.log('[MobileApp] Generation completed:', data);
  notifyFlutter('generationCompleted', data);
};

// Handle generation error from MobileGenerationViewer
const onGenerationError = (errorMsg: string) => {
  console.error('[MobileApp] Generation error:', errorMsg);
  error.value = errorMsg;
  notifyFlutter('generationCompleted', { success: false, error: errorMsg });
};

// Poll localStorage for generation request from Flutter
const pollForGenerationRequest = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max

    const poll = () => {
      const stored = localStorage.getItem('generationRequest');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localStorage.removeItem('generationRequest'); // Clean up
          resolve(parsed);
        } catch (e) {
          reject(new Error('Invalid generation request format'));
        }
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(poll, 100);
      } else {
        reject(new Error('Generation request not found'));
      }
    };

    poll();
  });
};

onMounted(async () => {
  try {
    // 1. Extract URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // 2. Apply locale from URL (from Flutter) or localStorage
    const urlLocale = urlParams.get('locale');
    const savedLocale = localStorage.getItem('i18nextLng');
    const localeToApply = urlLocale || savedLocale;
    if (localeToApply) {
      changeLocale(localeToApply);
      // Save to localStorage so it persists
      if (urlLocale) {
        localStorage.setItem('i18nextLng', urlLocale);
      }
    }

    // 3. Extract token from URL (for generation mode)
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('access_token', token);
    }

    // 3. Get presentation ID from route
    const presentationId = route.params.id as string;
    if (!presentationId) {
      throw new Error('No presentation ID found in URL');
    }

    // 4. Setup based on mode
    if (isGenerationMode.value) {
      // Generation mode: Vue handles streaming
      // Flutter shows loading until we signal ready

      // Fetch presentation first
      const fetchedPresentation = await api.getPresentation(presentationId);

      console.info('[MobileApp] Presentation loaded for generation:', {
        presentationId: fetchedPresentation.id,
        title: fetchedPresentation.title,
      });

      presentation.value = fetchedPresentation;

      // Poll for generation request from Flutter (stored in localStorage)
      console.log('[MobileApp] Waiting for generation request from Flutter...');
      const request = await pollForGenerationRequest();
      console.log('[MobileApp] Got generation request:', request);
      generationRequest.value = request;

      // Don't set loading to false here - MobileGenerationViewer will signal ready
      loading.value = false;
    } else {
      // View mode: setup navigation listeners
      window.addEventListener('message', handleSlideNavigation);
      (window as any).setSlideIndex = (index: number) => {
        handleSlideNavigation({
          data: { type: 'setSlideIndex', data: { index } },
        } as MessageEvent);
      };

      notifyFlutter('mobileViewReady', {});

      // Fetch presentation
      const fetchedPresentation = await api.getPresentation(presentationId);

      if (!fetchedPresentation || !fetchedPresentation.slides) {
        throw new Error('Invalid presentation data');
      }

      presentation.value = fetchedPresentation;
      loading.value = false;

      // Notify Flutter that presentation is loaded
      notifyFlutter('presentationLoaded', {
        success: true,
        slideCount: fetchedPresentation.slides.length,
      });
    }
  } catch (err) {
    handleError(err);
  }
});

onUnmounted(() => {
  // Clean up view mode listeners
  window.removeEventListener('message', handleSlideNavigation);
  delete (window as any).setSlideIndex;

  // Stop streaming if active
  if (generationStore.isStreaming) {
    generationStore.stopStreaming();
  }
});
</script>
