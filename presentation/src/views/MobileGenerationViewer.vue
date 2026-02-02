<template>
  <div class="mobile-generation-viewer">
    <!-- Loading spinner when streaming -->
    <FullscreenSpin :loading="isStreaming" :tip="$t('loading.generatingPresentation')" />

    <!-- Slide display -->
    <template v-if="slides.length">
      <Mobile />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore, useContainerStore, useSaveStore, useSnapshotStore } from '@/store';
import { useGenerationStore } from '@/store/generation';
import { convertToSlide, selectRandomTemplate } from '@/utils/slideLayout';
import type { SlideLayoutSchema } from '@/utils/slideLayout/types';
import type { PPTImageElement, Presentation } from '@/types/slides';
import { useGenerateImage } from '@/services/image/queries';
import { deleteDiscardedDB } from '@/utils/database';
import { getPresentationApi } from '@/services/presentation/api';
import Mobile from './Mobile/index.vue';
import FullscreenSpin from '@/components/FullscreenSpin.vue';

const props = defineProps<{
  presentation: Presentation;
  generationRequest: any;
}>();

const emit = defineEmits<{
  ready: [];
  completed: [data: { success: boolean; slideCount: number }];
  error: [message: string];
}>();

const slidesStore = useSlidesStore();
const generationStore = useGenerationStore();
const containerStore = useContainerStore();
const saveStore = useSaveStore();
const snapshotStore = useSnapshotStore();
const { slides } = storeToRefs(slidesStore);

const isStreaming = ref(true);
const abortController = ref<AbortController | null>(null);

// Pending image generations
const pendingImageGenerations = ref<Set<Promise<any>>>(new Set());

// Image generation mutation
const { mutateAsync: generateImageMutation } = useGenerateImage();

const viewport = computed(() => ({
  width: slidesStore.viewportSize,
  height: slidesStore.viewportSize * slidesStore.viewportRatio,
}));

// Process a single slide
async function processSlide(slideData: any, order: number, theme: any) {
  try {
    const template = await selectRandomTemplate(slideData.type);
    const slide = await convertToSlide(
      slideData as SlideLayoutSchema,
      viewport.value,
      theme || slidesStore.theme,
      template,
      order.toString()
    );

    // Add slide to store
    const updatedSlides = [...slidesStore.slides, slide];
    slidesStore.setSlides(updatedSlides);
    slidesStore.updateSlideIndex(updatedSlides.length - 1);

    console.log('[MobileGenerationViewer] Added slide', order);

    // Handle image generation if present
    const imageElement = slide.elements.find((el) => el.type === 'image') as PPTImageElement;
    const imagePrompt = (slideData as any).data?.image;

    if (imageElement && imagePrompt) {
      const promise = handleImageGeneration(slide.id, imageElement, imagePrompt);
      pendingImageGenerations.value.add(promise);
      promise.finally(() => {
        pendingImageGenerations.value.delete(promise);
      });
    }
  } catch (error) {
    console.error('[MobileGenerationViewer] Error processing slide:', error);
  }
}

// Handle image generation for a slide
async function handleImageGeneration(
  slideId: string,
  imageElement: PPTImageElement,
  prompt: string
): Promise<void> {
  const imageModel = props.generationRequest?.others?.imageModel;

  if (!imageModel) {
    console.warn('[MobileGenerationViewer] No image model configured');
    return;
  }

  // Set loading state
  updateSlideImage(slideId, imageElement.id, 'https://storage.huy-devops.site/ai-primary/loading.gif');

  try {
    const currentTheme = props.presentation.theme || slidesStore.theme;

    const response = await generateImageMutation({
      presentationId: props.presentation.id,
      slideId,
      params: {
        prompt,
        imageModel: imageModel,
        themeStyle: currentTheme.id,
        themeDescription: currentTheme.modifiers || undefined,
        artStyle: props.generationRequest?.others?.artStyle || undefined,
        artStyleModifiers: props.generationRequest?.others?.artStyleModifiers,
      },
    });

    if (response.imageUrl) {
      updateSlideImage(slideId, imageElement.id, response.imageUrl);
    } else {
      updateSlideImageError(slideId, imageElement.id);
    }
  } catch (error) {
    console.error('[MobileGenerationViewer] Image generation failed:', error);
    updateSlideImageError(slideId, imageElement.id);
  }
}

// Update slide image in store
function updateSlideImage(slideId: string, elementId: string, url: string) {
  const slideIndex = slidesStore.slides.findIndex((s) => s.id === slideId);
  if (slideIndex === -1) return;

  const slide = { ...slidesStore.slides[slideIndex] };
  const elementIndex = slide.elements.findIndex((el) => el.id === elementId);
  if (elementIndex === -1) return;

  const element = slide.elements[elementIndex] as PPTImageElement;
  slide.elements = [...slide.elements];
  slide.elements[elementIndex] = { ...element, src: url };

  const newSlides = [...slidesStore.slides];
  newSlides[slideIndex] = slide;
  slidesStore.setSlides(newSlides);
}

// Update slide image with error placeholder
function updateSlideImageError(slideId: string, elementId: string) {
  updateSlideImage(slideId, elementId, 'https://storage.huy-devops.site/ai-primary/error.svg');
}

// Start streaming generation
async function startStreaming() {
  const api = getPresentationApi();

  try {
    console.log('[MobileGenerationViewer] Starting streaming...');
    abortController.value = new AbortController();

    // Build the request for the API
    const request = {
      presentationId: props.generationRequest.presentationId,
      model: { name: props.generationRequest.model, provider: props.generationRequest.provider },
      language: props.generationRequest.language,
      slideCount: props.generationRequest.slideCount,
      outline: props.generationRequest.outline,
      presentation: props.generationRequest.presentation,
      others: props.generationRequest.others,
      grade: props.generationRequest.grade,
      subject: props.generationRequest.subject,
    };

    // Set request in store for reference
    generationStore.setRequest({
      ...request,
      generationOptions: {
        imageModel: props.generationRequest.others?.imageModel,
        artStyle: props.generationRequest.others?.artStyle,
        artStyleModifiers: props.generationRequest.others?.artStyleModifiers,
      },
    });

    const { stream } = await api.streamPresentation(request, abortController.value.signal);

    let order = 0;
    let buffer = '';
    const theme = props.presentation.theme || slidesStore.theme;

    for await (const chunk of stream) {
      buffer += chunk;

      // Process complete lines (NDJSON format)
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Strip SSE "data: " prefix if present
        let jsonStr = trimmed;
        if (trimmed.startsWith('data: ')) {
          jsonStr = trimmed.substring(6);
        } else if (trimmed.startsWith('data:')) {
          jsonStr = trimmed.substring(5);
        }

        if (!jsonStr || jsonStr.startsWith(':')) continue;

        try {
          const slideData = JSON.parse(jsonStr);

          // Skip token_usage metadata
          if (slideData.token_usage) {
            console.log('[MobileGenerationViewer] Token usage:', slideData.token_usage);
            continue;
          }

          await processSlide(slideData, order, theme);
          order++;
        } catch (e) {
          console.error('[MobileGenerationViewer] Error parsing slide:', e, jsonStr);
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      let jsonStr = buffer.trim();
      if (jsonStr.startsWith('data: ')) jsonStr = jsonStr.substring(6);
      else if (jsonStr.startsWith('data:')) jsonStr = jsonStr.substring(5);

      if (jsonStr && !jsonStr.startsWith(':')) {
        try {
          const slideData = JSON.parse(jsonStr);
          if (!slideData.token_usage) {
            await processSlide(slideData, order, theme);
          }
        } catch (e) {
          console.error('[MobileGenerationViewer] Error parsing final slide:', e);
        }
      }
    }

    console.log('[MobileGenerationViewer] Streaming completed, waiting for images...');
    isStreaming.value = false;

    // Wait for all pending image generations
    if (pendingImageGenerations.value.size > 0) {
      await Promise.allSettled(Array.from(pendingImageGenerations.value));
    }

    console.log('[MobileGenerationViewer] All images complete');

    emit('completed', {
      success: true,
      slideCount: slides.value.length,
    });
  } catch (error: any) {
    console.error('[MobileGenerationViewer] Streaming error:', error);
    isStreaming.value = false;

    if (error.name === 'AbortError') {
      console.log('[MobileGenerationViewer] Streaming aborted');
      return;
    }

    emit('error', error.message || 'Streaming failed');
  }
}

// Initialize
onMounted(async () => {
  // Setup container store
  containerStore.initialize({
    isRemote: true,
    presentation: props.presentation,
    mode: 'view',
  });

  // Initialize theme and viewport from presentation
  if (props.presentation.theme) {
    slidesStore.setTheme(props.presentation.theme);
  }
  if (props.presentation.viewport) {
    slidesStore.setViewportSize(props.presentation.viewport.width);
    slidesStore.setViewportRatio(props.presentation.viewport.height / props.presentation.viewport.width);
  }
  if (props.presentation.title) {
    slidesStore.setTitle(props.presentation.title);
  }

  // Clear any existing slides
  slidesStore.setSlides([]);

  // Reset save state
  saveStore.reset();

  // Initialize snapshot database
  await deleteDiscardedDB();
  await snapshotStore.initSnapshotDatabase();

  // Signal that we're ready (Flutter will show WebView)
  emit('ready');

  // Start streaming
  startStreaming();
});

onUnmounted(() => {
  // Abort streaming if active
  if (abortController.value) {
    abortController.value.abort();
  }
});
</script>

<style scoped>
.mobile-generation-viewer {
  width: 100%;
  height: 100%;
}
</style>
