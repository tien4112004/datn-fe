import { ref, watch, onUnmounted, type Ref } from 'vue';
import { convertToSlide, updateImageSource } from '@/utils/slideLayout';
import type { SlideLayoutSchema, SlideViewport } from '@/utils/slideLayout/types';
import type { PPTImageElement, SlideTheme } from '@/types/slides';
import { useSlidesStore } from '@/store';
import { useGenerationStore, type AiResultSlide } from '@/store/generation';
import { useSaveStore } from '@/store/save';
import { useAiResultById, useUpdateSlides, useSetParsed } from './usePresentationMutations';
import { useGenerateImage } from './useImageGeneration';
import type { PresentationGenerationRequest } from '@/types/generation';

interface Presentation {
  id: string;
  theme: SlideTheme;
  isParsed?: boolean;
  [key: string]: any;
}

export function usePresentationProcessor(
  presentation: Presentation | null,
  presentationId: string,
  isGenerating: boolean,
  generationRequest?: PresentationGenerationRequest
): { isProcessing: Ref<boolean> } {
  const isProcessing = ref(false);
  const processedStreamDataRef = ref<AiResultSlide[]>([]);
  const pendingImageGenerations = ref<Set<Promise<any>>>(new Set());

  // API Mutations
  const { mutateAsync: getAiResult } = useAiResultById(presentationId);
  const { mutateAsync: updateSlides } = useUpdateSlides(presentationId);
  const { mutateAsync: setParsed } = useSetParsed(presentationId);
  const { mutateAsync: generateImage } = useGenerateImage(presentationId);

  // Stores
  const generationStore = useGenerationStore();
  const slidesStore = useSlidesStore();
  const saveStore = useSaveStore();

  const viewport: SlideViewport = {
    width: slidesStore.viewportSize,
    height: slidesStore.viewportSize * slidesStore.viewportRatio,
  };

  // 1. Initial Logic
  if (presentation && !presentation.isParsed && !isGenerating) {
    processFullAiResult();
  } else if (!isGenerating && generationRequest) {
    generationStore.startStreaming({
      ...generationRequest,
      presentationId: presentationId,
    });
  }

  // 2. Process non-streaming result
  async function processFullAiResult() {
    try {
      isProcessing.value = true;
      const aiResult = await getAiResult();
      const theme = presentation?.theme || slidesStore.theme;

      const slides = await Promise.all(
        aiResult.map((slideData: any, i: number) =>
          convertToSlide(slideData as SlideLayoutSchema, viewport, theme, (i + 1).toString())
        )
      );

      slidesStore.setSlides(slides);
      slidesStore.updateSlideIndex(slides.length - 1);

      await updateSlides(slides);
      await setParsed();
      saveStore.markSaved();
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
        const slide = await convertToSlide(
          streamedSlide.result as SlideLayoutSchema,
          viewport,
          streamedSlide.theme || slidesStore.theme,
          streamedSlide.order?.toString()
        );

        // Handle Image Generation
        const imageElement = slide.elements.find((el) => el.type === 'image') as PPTImageElement;
        if (imageElement) {
          const prompt = (streamedSlide.result as any).data?.image;
          const promise = handleImageGeneration(slide.id, imageElement, prompt);

          // Track promise
          pendingImageGenerations.value.add(promise);
          promise.finally(() => pendingImageGenerations.value.delete(promise));
        }

        // Update Store incrementally (UI only)
        const updatedSlides = [...slidesStore.slides, slide];
        slidesStore.setSlides(updatedSlides);
        slidesStore.updateSlideIndex(updatedSlides.length - 1);
      } catch (error) {
        console.error('Error processing streamed slide:', error);
      }
    }
  }

  // 4. Extracted Image Logic
  async function handleImageGeneration(slideId: string, imageElement: PPTImageElement, prompt?: string) {
    const request = generationStore.request;
    if (!prompt || !request?.others?.imageModel) return;

    // Set loading state
    const loadingUrl =
      'https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif';
    await updateSlideImageInStore(slideId, imageElement.id, loadingUrl);

    try {
      const response: any = await generateImage({
        slideId,
        prompt,
        model: request.others.imageModel,
      });

      const imageUrl = response.images[0]?.url;
      if (imageUrl) {
        await updateSlideImageInStore(slideId, imageElement.id, imageUrl);
      }
    } catch (error) {
      console.error('Image generation failed:', error);
    }
  }

  // Helper to update store specific image
  async function updateSlideImageInStore(slideId: string, elementId: string, url: string) {
    const slideIndex = slidesStore.slides.findIndex((s) => s.id === slideId);
    if (slideIndex === -1) return;

    const slide = { ...slidesStore.slides[slideIndex] };
    const elementIndex = slide.elements.findIndex((el) => el.id === elementId);
    if (elementIndex === -1) return;

    const updatedElement = await updateImageSource(slide.elements[elementIndex] as PPTImageElement, url);
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
        processStreamedSlides(newData);
      }
    },
    { deep: true }
  );

  watch(
    () => generationStore.isStreaming,
    async (isStreaming, wasStreaming) => {
      if (wasStreaming && !isStreaming) {
        try {
          // Wait for pending images before saving
          if (pendingImageGenerations.value.size > 0) {
            await Promise.all(Array.from(pendingImageGenerations.value));
          }

          // Single upsert at the end
          await updateSlides(slidesStore.slides);
          await setParsed();
          saveStore.markSaved();

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

  return { isProcessing };
}
