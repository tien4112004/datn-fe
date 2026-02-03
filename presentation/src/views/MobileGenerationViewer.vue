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
import { computed, onMounted, onUnmounted, ref, getCurrentInstance } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore, useContainerStore, useSaveStore, useSnapshotStore } from '@/store';
import { useGenerationStore } from '@/store/generation';
import { convertToSlide, selectRandomTemplate } from '@/utils/slideLayout';
import type { SlideLayoutSchema } from '@/utils/slideLayout/types';
import type { PPTImageElement, Presentation } from '@/types/slides';
import { useGenerateImage } from '@/services/image/queries';
import { useSetParsed } from '@/services/presentation/queries';
import { deleteDiscardedDB } from '@/utils/database';
import { getPresentationApi } from '@/services/presentation/api';
import { useSavePresentation } from '@/hooks/useSavePresentation';
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

// Get pinia instance for save hook
const instance = getCurrentInstance();
const pinia = instance?.appContext.config.globalProperties.$pinia;

// Save presentation hook
const { savePresentation } = useSavePresentation(props.presentation.id, pinia!);

// Set parsed mutation
const { mutateAsync: setParsedMutation } = useSetParsed();

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

    console.log('[MobileGenerationViewer] Checking for image in slide:', {
      order,
      slideId: slide.id,
      hasImageElement: !!imageElement,
      hasImagePrompt: !!imagePrompt,
      imagePrompt: imagePrompt ? imagePrompt.substring(0, 50) + '...' : null,
      slideDataKeys: Object.keys(slideData.data || {}),
    });

    if (imageElement && imagePrompt) {
      console.log('[MobileGenerationViewer] Starting image generation for slide:', order);
      const promise = handleImageGeneration(slide.id, imageElement, imagePrompt);
      pendingImageGenerations.value.add(promise);
      promise.finally(() => {
        pendingImageGenerations.value.delete(promise);
        console.log(
          '[MobileGenerationViewer] Image generation finished for slide:',
          order,
          'Pending:',
          pendingImageGenerations.value.size
        );
      });
    } else if (imageElement && !imagePrompt) {
      console.warn('[MobileGenerationViewer] Slide has image element but no image prompt:', order);
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

  console.log('[MobileGenerationViewer] Image generation requested:', {
    slideId,
    elementId: imageElement.id,
    prompt: prompt.substring(0, 50) + '...',
    imageModel,
  });

  if (!imageModel) {
    console.warn('[MobileGenerationViewer] No image model configured, skipping image generation');
    return;
  }

  // Set loading state
  updateSlideImage(slideId, imageElement.id, 'https://storage.huy-devops.site/ai-primary/loading.gif');
  console.log('[MobileGenerationViewer] Set loading state for image:', {
    slideId,
    elementId: imageElement.id,
  });

  try {
    const currentTheme = props.presentation.theme || slidesStore.theme;

    console.log('[MobileGenerationViewer] Calling generateImageMutation:', {
      presentationId: props.presentation.id,
      slideId,
      imageModel,
      themeStyle: currentTheme.id,
    });

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

    console.log('[MobileGenerationViewer] Image generation response:', {
      slideId,
      imageUrl: response.imageUrl,
      fullResponse: response,
    });

    if (response.imageUrl) {
      updateSlideImage(slideId, imageElement.id, response.imageUrl);
      console.log('[MobileGenerationViewer] Updated slide image successfully:', {
        slideId,
        elementId: imageElement.id,
        imageUrl: response.imageUrl,
      });
    } else {
      console.warn('[MobileGenerationViewer] No imageUrl in response, setting error state');
      updateSlideImageError(slideId, imageElement.id);
    }
  } catch (error) {
    console.error('[MobileGenerationViewer] Image generation failed:', {
      slideId,
      elementId: imageElement.id,
      error,
    });
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
    console.log('[MobileGenerationViewer] Generation request others:', props.generationRequest?.others);
    console.log('[MobileGenerationViewer] Image model:', props.generationRequest?.others?.imageModel);
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

    // Log final state of all slides with their images
    console.log(
      '[MobileGenerationViewer] Final slides state:',
      slides.value.map((slide, index) => {
        const imageElements = slide.elements.filter((el) => el.type === 'image');
        return {
          index,
          slideId: slide.id,
          imageElements: imageElements.map((img: any) => ({
            id: img.id,
            src: img.src,
          })),
        };
      })
    );

    // Save presentation to backend
    try {
      console.log('[MobileGenerationViewer] Saving presentation to backend...');
      await savePresentation({
        title: props.presentation.title || slidesStore.title,
        slides: slides.value,
        theme: props.presentation.theme || slidesStore.theme,
        viewport: {
          width: slidesStore.viewportSize,
          height: slidesStore.viewportSize * slidesStore.viewportRatio,
        },
        thumbnail: props.presentation.thumbnail,
      });
      console.log('[MobileGenerationViewer] Presentation saved successfully');

      // Mark as parsed on backend
      console.log('[MobileGenerationViewer] Marking presentation as parsed...');
      await setParsedMutation(props.presentation.id);
      console.log('[MobileGenerationViewer] Presentation marked as parsed');
    } catch (saveError) {
      console.error('[MobileGenerationViewer] Failed to save presentation:', saveError);
      // Continue anyway - user can still see the slides
    }

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
