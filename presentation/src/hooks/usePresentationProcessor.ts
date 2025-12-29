import { ref, watch, onUnmounted, type Ref } from 'vue';
import type { Pinia } from 'pinia';
import { convertToSlide, updateImageSource, selectRandomTemplate } from '@/utils/slideLayout';
import type { SlideLayoutSchema, SlideViewport } from '@/utils/slideLayout/types';
import type { PPTImageElement, SlideTheme } from '@/types/slides';
import { useSlidesStore } from '@/store';
import { useGenerationStore, type AiResultSlide } from '@/store/generation';
import { useSaveStore } from '@/store/save';
import { useAiResultById, useUpdateSlides, useSetParsed } from './usePresentationMutations';
import { useGenerateImage } from './useImageGeneration';
import type { PresentationGenerationRequest } from '@/types/generation';
import { useSavePresentation } from './useSavePresentation';

/**
 * Extract title from outline markdown
 * Takes the first ## heading as the title
 * Example: "## This is the title\n---\n..." -> "This is the title"
 */
function extractTitleFromOutline(outline: string): string {
  const match = outline.match(/^##\s+(.+?)$/m);
  return match ? match[1].trim() : 'Untitled Presentation';
}

interface Presentation {
  id: string;
  title: string;
  theme?: SlideTheme;
  isParsed?: boolean;
  [key: string]: any;
}

export function usePresentationProcessor(
  presentation: Presentation | null,
  presentationId: string,
  isGenerating: boolean,
  pinia: Pinia,
  generationRequest?: PresentationGenerationRequest
): { isProcessing: Ref<boolean> } {
  const isProcessing = ref(false);
  const processedStreamDataRef = ref<AiResultSlide[]>([]);
  const pendingImageGenerations = ref<Set<Promise<any>>>(new Set());
  const pendingSlideProcessing = ref<Set<Promise<void>>>(new Set());

  // API Mutations
  const { mutateAsync: getAiResult } = useAiResultById(presentationId);
  const { mutateAsync: setParsed } = useSetParsed(presentationId);
  const { mutateAsync: generateImage } = useGenerateImage(presentationId);

  // Stores
  const generationStore = useGenerationStore();
  const slidesStore = useSlidesStore();

  // Save hook
  const { savePresentation: savePresentationFn } = useSavePresentation(presentationId, pinia);

  const viewport: SlideViewport = {
    width: slidesStore.viewportSize,
    height: slidesStore.viewportSize * slidesStore.viewportRatio,
  };

  // 0. Set theme and viewport from presentation if available
  if (presentation) {
    if (presentation.theme) {
      slidesStore.setTheme(presentation.theme);
    }
    if (presentation.viewport) {
      slidesStore.setViewportSize(presentation.viewport.width);
      slidesStore.setViewportRatio(presentation.viewport.height / presentation.viewport.width);
    }
  }

  // 1. Initial Logic
  if (generationRequest && !generationStore.isStreaming) {
    // New presentation with generation request - start streaming
    generationStore.startStreaming({
      ...generationRequest,
      presentationId: presentationId,
    });
  } else if (presentation && !presentation.isParsed && !generationRequest) {
    // Old unparsed presentation without generation request - fetch AI result
    processFullAiResult();
  }

  // 2. Process non-streaming result
  async function processFullAiResult() {
    try {
      isProcessing.value = true;

      // Get both slides and generation options from AI result
      const { slides: aiResultSlides, generationOptions } = await getAiResult();

      // Restore generation options to store if available
      if (generationOptions) {
        // Validate that required fields exist
        if (!generationOptions.imageModel?.name) {
          console.error('[processFullAiResult] Invalid generation options - missing model');
        } else {
          // Reconstruct the request object with the generation options
          const reconstructedRequest = {
            presentationId: presentationId,
            outline: '', // Not needed for image generation
            model: { name: '', provider: '' }, // Not needed for image generation
            slideCount: aiResultSlides.length,
            language: '',
            presentation: {
              theme: presentation?.theme || slidesStore.theme,
              viewport: viewport,
            },
            generationOptions: generationOptions,
          };
          generationStore.setRequest(reconstructedRequest);
        }
      } else {
        console.warn(
          '[processFullAiResult] No generation options available - images will show error placeholders'
        );
      }

      const theme = presentation?.theme || slidesStore.theme;

      const slides = await Promise.all(
        aiResultSlides.map(async (slideData: any, i: number) => {
          const template = await selectRandomTemplate(slideData.type);
          return convertToSlide(
            slideData as SlideLayoutSchema,
            viewport,
            theme,
            template,
            (i + 1).toString()
          );
        })
      );

      slidesStore.setSlides(slides);
      slidesStore.updateSlideIndex(slides.length - 1);

      // Generate images for slides that have image elements
      const imageGenerationPromises: Promise<any>[] = [];

      slides.forEach((slide, index) => {
        const slideData = aiResultSlides[index];
        const imageElement = slide.elements.find((el) => el.type === 'image') as PPTImageElement;

        // Type guard: check if data has image property
        const imagePrompt = slideData.data && 'image' in slideData.data ? slideData.data.image : undefined;

        if (imageElement && imagePrompt) {
          const promise = handleImageGeneration(slide.id, imageElement, imagePrompt);
          imageGenerationPromises.push(promise);
        }
      });

      // Wait for all image generations to complete
      if (imageGenerationPromises.length > 0) {
        await Promise.allSettled(imageGenerationPromises);
      }

      // Save presentation with full data (slides, metadata, thumbnail)
      dispatchGeneratingEvent(true);

      try {
        if (presentation) {
          await savePresentationFn({
            title: presentation.title,
            slides: slidesStore.slides,
            theme: slidesStore.theme,
            viewport,
            thumbnail: presentation.thumbnail,
          });
        }

        await setParsed();
      } finally {
        dispatchGeneratingEvent(false);
      }
    } catch (error) {
      console.error('Error processing AI result:', error);
      dispatchMessage('error', 'Failed to process presentation');
    } finally {
      isProcessing.value = false;
    }
  }

  // 3. Process Streaming Data
  async function processStreamedSlides(newStreamedData: AiResultSlide[]) {
    const newData = newStreamedData.slice(processedStreamDataRef.value.length);
    if (!newData.length) return;

    processedStreamDataRef.value = [...processedStreamDataRef.value, ...newData];

    for (const streamedSlide of newData) {
      try {
        const template = await selectRandomTemplate(streamedSlide.result.type);
        const slide = await convertToSlide(
          streamedSlide.result as SlideLayoutSchema,
          viewport,
          streamedSlide.theme || slidesStore.theme,
          template,
          streamedSlide.order?.toString()
        );

        // Update Store incrementally (UI only) - ADD SLIDE TO STORE FIRST
        const updatedSlides = [...slidesStore.slides, slide];
        slidesStore.setSlides(updatedSlides);
        slidesStore.updateSlideIndex(updatedSlides.length - 1);

        // Get the actual slide ID from the store after insertion
        const addedSlideIndex = updatedSlides.length - 1;
        const actualSlideId = slidesStore.slides[addedSlideIndex]?.id;

        // Handle Image Generation - USE ACTUAL SLIDE ID FROM STORE
        const imageElement = slide.elements.find((el) => el.type === 'image') as PPTImageElement;
        if (imageElement && actualSlideId) {
          const prompt = (streamedSlide.result as any).data?.image;
          const promise = handleImageGeneration(actualSlideId, imageElement, prompt);

          // Track promise
          pendingImageGenerations.value.add(promise);
          promise.finally(() => {
            pendingImageGenerations.value.delete(promise);
          });
        }
      } catch (error) {
        console.error('Error processing streamed slide:', error);
      }
    }
  }

  // 4. Extracted Image Logic
  async function handleImageGeneration(
    slideId: string,
    imageElement: PPTImageElement,
    prompt?: string
  ): Promise<{ success: boolean; error?: Error }> {
    const request = generationStore.request;

    if (!prompt) {
      await updateSlideImageInStoreWithError(slideId, imageElement.id);
      return { success: false, error: new Error('No prompt provided') };
    }

    if (!request?.generationOptions?.imageModel) {
      await updateSlideImageInStoreWithError(slideId, imageElement.id);
      return { success: false, error: new Error('No image model configured') };
    }

    // Set loading state
    const loadingUrl =
      'https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif';
    await updateSlideImageInStore(slideId, imageElement.id, loadingUrl);

    try {
      // Get current theme info
      const currentTheme = presentation?.theme || slidesStore.theme;

      const response = await generateImage({
        slideId,
        prompt,
        model: request.generationOptions.imageModel,
        themeStyle: currentTheme.id,
        themeDescription: currentTheme.modifiers || undefined,
        artStyle: request.generationOptions.artStyle || undefined,
        artStyleModifiers: request.generationOptions.artStyleModifiers,
      });

      const imageUrl = response.imageUrl;
      if (imageUrl) {
        await updateSlideImageInStore(slideId, imageElement.id, imageUrl);
        return { success: true };
      } else {
        console.error('No image URL in response for slide:', slideId);
        await updateSlideImageInStoreWithError(slideId, imageElement.id);
        return { success: false, error: new Error('No image URL in response') };
      }
    } catch (error) {
      console.error('Image generation failed for slide:', slideId, error);
      await updateSlideImageInStoreWithError(slideId, imageElement.id);
      return { success: false, error: error as Error };
    }
  }

  // Helper to convert URL to base64
  async function urlToBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert URL to base64:', error);
      throw error;
    }
  }

  // Helper to update store specific image
  async function updateSlideImageInStore(slideId: string, elementId: string, url: string) {
    const slideIndex = slidesStore.slides.findIndex((s) => s.id === slideId);

    if (slideIndex === -1) {
      console.error('Slide not found in store:', slideId);
      return;
    }

    const slide = { ...slidesStore.slides[slideIndex] };
    const elementIndex = slide.elements.findIndex((el) => el.id === elementId);

    if (elementIndex === -1) {
      console.error('Element not found in slide:', elementId);
      return;
    }

    // Convert URL to base64 for portability
    let imageData = url;
    if (!url.startsWith('data:')) {
      try {
        imageData = await urlToBase64(url);
      } catch (error) {
        console.error('Failed to convert image to base64, using URL fallback:', error);
        // Fall back to URL if conversion fails
      }
    }

    const updatedElement = await updateImageSource(
      slide.elements[elementIndex] as PPTImageElement,
      imageData
    );
    slide.elements = [...slide.elements];
    slide.elements[elementIndex] = updatedElement;

    const newSlides = [...slidesStore.slides];
    newSlides[slideIndex] = slide;
    slidesStore.setSlides(newSlides);
  }

  // Helper to update slide with error placeholder
  async function updateSlideImageInStoreWithError(slideId: string, elementId: string) {
    const slideIndex = slidesStore.slides.findIndex((s) => s.id === slideId);
    if (slideIndex === -1) {
      console.error('Slide not found for error update:', slideId);
      return;
    }

    const slide = { ...slidesStore.slides[slideIndex] };
    const elementIndex = slide.elements.findIndex((el) => el.id === elementId);
    if (elementIndex === -1) {
      console.error('Element not found for error update:', elementId);
      return;
    }

    // Update element with error placeholder and error flag
    const element = slide.elements[elementIndex] as PPTImageElement;

    // Use inline SVG error icon (no external fetch needed, avoids CORS issues)
    const errorIconSrc =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNSIgZmlsbD0iI2RjMzU0NSIvPjxsaW5lIHgxPSIxMCIgeTE9IjEwIiB4Mj0iMjIiIHkyPSIyMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48bGluZSB4MT0iMjIiIHkxPSIxMCIgeDI9IjEwIiB5Mj0iMjIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+';

    const updatedElement = {
      ...element,
      src: errorIconSrc,
      hasError: true, // Error flag
    } as any;

    slide.elements = [...slide.elements];
    slide.elements[elementIndex] = updatedElement;

    const newSlides = [...slidesStore.slides];
    newSlides[slideIndex] = slide;

    slidesStore.setSlides(newSlides);
  }

  // 5. Watchers
  watch(
    () => generationStore.streamedData,
    (newData) => {
      if (generationStore.isStreaming && newData.length > 0) {
        // Track slide processing promises to ensure they complete before finalization
        const processingPromise = processStreamedSlides(newData);
        pendingSlideProcessing.value.add(processingPromise);
        processingPromise.finally(() => {
          pendingSlideProcessing.value.delete(processingPromise);
        });
      }
    },
    { deep: true }
  );

  watch(
    () => generationStore.isStreaming,
    async (isStreaming, wasStreaming) => {
      if (wasStreaming && !isStreaming) {
        try {
          // STEP 1: Wait for all slide processing to complete
          if (pendingSlideProcessing.value.size > 0) {
            await Promise.all(Array.from(pendingSlideProcessing.value));
          }

          // STEP 2: Wait for all image generations to complete (including all retries)
          if (pendingImageGenerations.value.size > 0) {
            const promisesToWait = Array.from(pendingImageGenerations.value);
            await Promise.allSettled(promisesToWait);
          }

          // STEP 3: Run finalization logic (ONLY after ALL slides processed and ALL images complete)

          // Dispatch generating event BEFORE saving
          dispatchGeneratingEvent(true);

          try {
            // Extract title from outline markdown (first ## heading)
            const title =
              presentation?.title ||
              (generationRequest?.outline
                ? extractTitleFromOutline(generationRequest.outline)
                : 'Untitled Presentation');

            // Save presentation with all data (slides, metadata, thumbnail)
            await savePresentationFn({
              title,
              slides: slidesStore.slides,
              theme: slidesStore.theme,
              viewport,
              thumbnail: presentation?.thumbnail,
            });

            await setParsed();
          } finally {
            // Always clear generating state
            dispatchGeneratingEvent(false);
          }

          processedStreamDataRef.value = [];
          generationStore.clearStreamedData();
        } catch (error) {
          console.error('Error finalizing presentation:', error);
          dispatchMessage('error', 'Failed to finalize presentation');
        }
      }
    }
  );

  watch(
    () => generationStore.error,
    async (error, previous) => {
      if (error && error !== previous) {
        dispatchMessage('error', error);
      }
    }
  );

  onUnmounted(() => generationStore.stopStreaming());

  function dispatchMessage(type: string, message: string) {
    window.dispatchEvent(new CustomEvent('app.message', { detail: { type, message } }));
  }

  function dispatchGeneratingEvent(isGenerating: boolean) {
    window.dispatchEvent(
      new CustomEvent('app.presentation.generating', {
        detail: { isGenerating },
      })
    );
  }

  return { isProcessing };
}
